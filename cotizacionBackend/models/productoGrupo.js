module.exports = (sequelize, DataTypes) => {
    const ProductoGrupo = sequelize.define('producto_grupo', {
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    return ProductoGrupo
}
