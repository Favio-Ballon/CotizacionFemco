module.exports = (sequelize, Sequelize) => {
    const ProductoCotizacion = sequelize.define('producto_cotizacion', {
        cantidad: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        item: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        }
    })

    return ProductoCotizacion
}
