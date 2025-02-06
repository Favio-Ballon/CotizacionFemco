module.exports = (sequelize, Sequelize) => {
    const Producto = sequelize.define('producto', {
        catalogo: {
            type: Sequelize.INTEGER,
            nullable: false,
            primaryKey: true,
            autoIncrement: true
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

    // Hook to set the starting value for catalogo
    Producto.beforeSync(async () => {
        const maxCatalogo = await Producto.max('catalogo')
        if (maxCatalogo) {
            await sequelize.query(
                `ALTER TABLE productos AUTO_INCREMENT = ${maxCatalogo + 1}`
            )
        }
    })

    return Producto
}
