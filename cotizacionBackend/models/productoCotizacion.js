module.exports = (sequelize, DataTypes) => {
    const ProductoCotizacion = sequelize.define('producto_cotizacion', {
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    })

    return ProductoCotizacion
}
