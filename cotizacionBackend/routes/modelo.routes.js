const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/modelo.controller.js')

    router.get('/', authMiddleware, controller.listModelo)
    router.get('/:id', authMiddleware, controller.listModeloById)
    router.post('/', authMiddleware, controller.createModelo)
    router.put('/:id', authMiddleware, controller.updateModelo)
    router.delete('/:id', authMiddleware, controller.deleteModelo)

    app.use('/modelo', router)
}
