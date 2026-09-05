import multer from "multer";
import fs from "fs";
import path from "path";

export const getFileCategory = (mimetype, originalname) => {
  const ext = path.extname(originalname).toLowerCase();

  if (mimetype.startsWith("image/")) return "images";
  if (mimetype.startsWith("video/")) return "videos";
  if (mimetype.startsWith("audio/")) return "audio";

  const docExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".zip", ".rar", ".7z", ".json", ".xml"];
  if (
    mimetype.startsWith("application/pdf") ||
    mimetype.startsWith("text/") ||
    mimetype.includes("word") ||
    mimetype.includes("excel") ||
    mimetype.includes("spreadsheet") ||
    mimetype.includes("presentation") ||
    mimetype.includes("zip") ||
    docExtensions.includes(ext)
  ) {
    return "documents";
  }

  return "others";
};

export const getMessageType = (category) => {
  switch (category) {
    case "images":
      return "image";
    case "videos":
      return "video";
    case "audio":
      return "audio";
    case "documents":
      return "document";
    default:
      return "other";
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = getFileCategory(file.mimetype, file.originalname);
    const targetDir = path.join("uploads", category);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${uniqueSuffix}-${basename}${ext}`);
  },
});

const blockedExtensions = [
  ".exe", ".bat", ".cmd", ".sh", ".msi", ".vbs", ".scr", ".jar", ".com", ".ps1"
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (blockedExtensions.includes(ext)) {
    return cb(new Error(`File type '${ext}' is not allowed for security reasons.`), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
    files: 5,
  },
});

export const handleUploadMiddleware = (req, res, next) => {
  const uploadArray = upload.array("files", 5);

  uploadArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File is too large! Maximum file size allowed is 25 MB." });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "Too many files! Maximum 5 files allowed per send." });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: "Unexpected field name for files." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
