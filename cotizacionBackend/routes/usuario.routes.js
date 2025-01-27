const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/usuario.controller.js')

    router.get('/', controller.listUsuario)
    router.get('/:id', controller.listUsuarioById)
    router.post('/', controller.createUsuario)
    router.put('/:id', controller.updateUsuario)
    router.delete('/:id', controller.deleteUsuario)

    router.post('/login', controller.login)

    app.use('/usuario', router)
}
