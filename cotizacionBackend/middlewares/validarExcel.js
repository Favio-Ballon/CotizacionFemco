const fileUpload = require('express-fileupload');
const path = require('path');

// Middleware to handle file upload and validation
const uploadAndValidateExcel = (req, res, next) => {
    // Check if a file is uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({ message: 'No se ha subido ningún archivo.' });
    }

    // Get the uploaded file
    const file = req.files.file;

    // Validate file type
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.name).toLowerCase());
    if (!extname) {
        return res.status(400).send({ message: 'Solo se permiten archivos .xlsx o .xls.' });
    }

    // Define the upload path
    const uploadPath = path.resolve(__dirname, '../uploads', `${Date.now()}-${file.name}`);

    // Move the file to the upload directory
    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error al subir el archivo.' });
        }

        // Add the file path to the request object
        req.filePath = uploadPath;
        
        next();
    });
};

module.exports = uploadAndValidateExcel;