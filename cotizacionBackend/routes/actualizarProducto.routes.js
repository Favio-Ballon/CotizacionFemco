const authMiddleware = require('../middlewares/authMiddleware')
const uploadAndValidateExcel = require('../middlewares/validarExcel.js')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/actualizarProducto.controller.js')

    // Use the custom middleware to handle the file upload and validation
    router.post(
        '/upload',
        authMiddleware,
        uploadAndValidateExcel,
        controller.actualizarProductos
    )

    app.use('/excel', router)
}
