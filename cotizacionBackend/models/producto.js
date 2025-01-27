module.exports = (sequelize, Sequelize) => {
    const Producto = sequelize.define('producto', {
        catalogo: {
            type: Sequelize.INTEGER,
            nullable: false,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING,
            nullable: false
        },
        precio: {
            type: Sequelize.DOUBLE
        },
        esTemporal: {
            type: Sequelize.BOOLEAN
        }
    })
    return Producto
}
