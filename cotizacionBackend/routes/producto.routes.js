const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/producto.controller.js')

    router.get('/', controller.listProducto)
    router.get('/:id', controller.listProductoById)
    router.post('/', controller.createProducto)
    router.put('/:id', controller.updateProducto)
    router.delete('/:id', controller.deleteProducto)

    app.use('/producto', router)
}
