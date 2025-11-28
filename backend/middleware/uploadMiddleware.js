import upload, { uploadNotice } from '../config/multer.js';

export const uploadImage = upload.single('image');

export const uploadPDF = uploadNotice.single('pdfFile');

export const uploadCompletion = upload.single('completionImage');
