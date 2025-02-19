const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/grupo.controller.js')

    router.get('/', controller.listGrupo)
    router.get('/:id', controller.listGrupoById)
    router.post('/', authMiddleware, controller.createGrupo)
    router.put('/:id', authMiddleware, controller.updateGrupo)
    router.delete('/:id', authMiddleware, controller.deleteGrupo)

    router.post('/create', authMiddleware, controller.createGrupoConProductos)
    router.put(
        '/update/:id',
        authMiddleware,
        controller.updateGrupoConProductos
    )

    app.use('/grupo', router)
}
