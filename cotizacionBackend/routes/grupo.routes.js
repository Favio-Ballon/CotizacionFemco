const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/grupo.controller.js')

    router.get('/', controller.listGrupo)
    router.get('/:id', controller.listGrupoById)
    router.post('/', controller.createGrupo)
    router.put('/:id', controller.updateGrupo)
    router.delete('/:id', controller.deleteGrupo)

    app.use('/grupo', router)
}
