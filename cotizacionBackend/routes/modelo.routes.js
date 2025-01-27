const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/modelo.controller.js')

    router.get('/', controller.listModelo)
    router.get('/:id', controller.listModeloById)
    router.post('/', controller.createModelo)
    router.put('/:id', controller.updateModelo)
    router.delete('/:id', controller.deleteModelo)

    app.use('/modelo', router)
}
