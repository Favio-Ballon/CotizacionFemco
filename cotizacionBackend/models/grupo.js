module.exports = (sequelize, Sequelize) => {
    const Grupo = sequelize.define('grupo', {
        nombre: {
            type: Sequelize.STRING,
            nullable: false
        }
    })
    return Grupo
}
