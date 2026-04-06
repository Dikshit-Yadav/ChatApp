// upload file info
export const processUploadedFile = (file) => {
    if (!file) throw new Error("No file provided");
    return `/uploads/${file.filename}`;
};