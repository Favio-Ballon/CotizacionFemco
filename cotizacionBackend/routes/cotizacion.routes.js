const authMiddleware = require('../middlewares/authMiddleware')

module.exports = (app) => {
    let router = require('express').Router()

    const controller = require('../controllers/cotizacion.controller.js')

    router.get('/', controller.listCotizacion)
    router.get('/:id', controller.listCotizacionById)
    router.post('/', controller.createCotizacion)
    router.put('/:id', controller.updateCotizacion)
    router.delete('/:id', controller.deleteCotizacion)

    //imagen
    router.post('/upload/:id', controller.addOrUpdateImage)

    app.use('/cotizacion', router)
}
