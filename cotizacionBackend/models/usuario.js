module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define('usuario', {
        nombre: {
            type: Sequelize.STRING,
            nullable: false
        },
        apellido: {
            type: Sequelize.STRING,
            nullable: false
        },
        correo: {
            type: Sequelize.STRING,
            nullable: false
        },
        usuario: {
            type: Sequelize.STRING,
            nullable: false
        },
        contrasena: {
            type: Sequelize.STRING,
            nullable: false
        },
        firma: {
            type: Sequelize.STRING
        },
        telefono: {
            type: Sequelize.STRING
        },
    })
    return Usuario
}
