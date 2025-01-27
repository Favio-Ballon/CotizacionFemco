module.exports = (sequelize, Sequelize) => {
    const Modelo = sequelize.define('modelo', {
        nombre: {
            type: Sequelize.STRING,
            nullable: false
        },
        unidad: {
            type: Sequelize.STRING
        }
    })
    return Modelo
}
