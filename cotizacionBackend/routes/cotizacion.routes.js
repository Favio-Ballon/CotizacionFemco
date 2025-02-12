const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/cotizacion.controller.js')

    router.get('/', authMiddleware,controller.listCotizacion)
    router.get('/:id',authMiddleware, controller.listCotizacionById)
    router.post('/', authMiddleware,controller.createCotizacion)
    router.put('/:id',authMiddleware, controller.updateCotizacion)
    router.delete('/:id',authMiddleware, controller.deleteCotizacion)

    //imagen
    router.post('/upload/:id', controller.addOrUpdateImage)

    app.use('/cotizacion', router)
}
