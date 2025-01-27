module.exports = (app) => {
    require('./cotizacion.routes')(app)
    require('./grupo.routes')(app)
    require('./modelo.routes')(app)
    require('./producto.routes')(app)
    require('./usuario.routes')(app)
    require('./actualizarProducto.routes')(app)
}
