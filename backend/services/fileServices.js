import { getFileCategory, getMessageType } from "../middleware/upload.js";

// upload single file info
export const processUploadedFile = (file) => {
    if (!file) throw new Error("No file provided");
    const category = getFileCategory(file.mimetype, file.originalname);
    const type = getMessageType(category);
    
    const relativePath = file.path.replace(/\\/g, "/");
    
    return {
        url: `/${relativePath}`,
        type: type,
        name: file.originalname,
        size: file.size,
    };
};

// upload multiple files info
export const processUploadedFiles = (files) => {
    if (!files || files.length === 0) throw new Error("No files provided");
    return files.map((file) => processUploadedFile(file));
};