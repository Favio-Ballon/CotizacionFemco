module.exports = (sequelize, Sequelize) => {
    const Cotizacion = sequelize.define('cotizacion', {
        nombre: {
            type: Sequelize.STRING,
            nullable: false
        },
        total: {
            type: Sequelize.DOUBLE
        },
        fecha: {
            type: Sequelize.DATE
        },
        descuento: {
            type: Sequelize.DOUBLE
        },
        formaPago: {
            type: Sequelize.STRING
        },
        tiempoEntrega: {
            type: Sequelize.STRING
        },
        transporte: {
            type: Sequelize.BOOLEAN
        },
        pdf: {
            type: Sequelize.STRING
        }
    })
    return Cotizacion
}
