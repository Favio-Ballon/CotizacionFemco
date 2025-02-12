const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/producto.controller.js')

    router.get('/', authMiddleware, controller.listProducto)
    router.get('/:id', authMiddleware, controller.listProductoById)
    router.post('/', authMiddleware, controller.createProducto)
    router.put('/:id', authMiddleware, controller.updateProducto)
    router.delete('/:id', authMiddleware, controller.deleteProducto)

    router.post('/create', authMiddleware, controller.createProductoWeb)
    router.put('/update/:id', authMiddleware, controller.updateProductoWeb)
    router.post('/temporal', authMiddleware, controller.createProductoTemporal)

    app.use('/producto', router)
}
