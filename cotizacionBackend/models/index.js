const dbConfig = require('../config/db.config.js')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: 'mysql'
})

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

db.producto = require('./producto.js')(sequelize, Sequelize)
db.grupo = require('./grupo.js')(sequelize, Sequelize)
db.modelo = require('./modelo.js')(sequelize, Sequelize)
db.usuario = require('./usuario.js')(sequelize, Sequelize)
db.cotizacion = require('./cotizacion.js')(sequelize, Sequelize)
db.productoGrupo = require('./productoGrupo.js')(sequelize, Sequelize)
db.productoCotizacion = require('./productoCotizacion.js')(sequelize, Sequelize)

//producto tiene modelo
db.producto.belongsTo(db.modelo, {
    as: 'modelo',
    foreignKey: 'modeloId'
})
db.modelo.hasMany(db.producto, {
    as: 'productos',
    foreignKey: 'modeloId'
})

//producto puede estar en n grupos y viceversa
db.producto.belongsToMany(db.grupo, {
    through: db.productoGrupo,
    as: 'grupos',
    foreignKey: 'catalogo'
})
db.grupo.belongsToMany(db.producto, {
    through: db.productoGrupo,
    as: 'productos',
    foreignKey: 'grupoId'
})

//producto tiene cotizaciones
db.producto.belongsToMany(db.cotizacion, {
    through: db.productoCotizacion,
    as: 'cotizaciones',
    foreignKey: 'productoId'
})
db.cotizacion.belongsToMany(db.producto, {
    through: db.productoCotizacion,
    as: 'productos',
    foreignKey: 'cotizacionId'
})

//usuario tiene cotizaciones
db.usuario.hasMany(db.cotizacion, {
    as: 'cotizaciones',
    foreignKey: 'usuarioId'
})
db.cotizacion.belongsTo(db.usuario, {
    as: 'usuario',
    foreignKey: 'usuarioId'
})

//usuario puede crear productos, pero hay productos que no tienen usuarios
db.usuario.hasMany(db.producto, {
    as: 'productos',
    foreignKey: 'usuarioId'
})
db.producto.belongsTo(db.usuario, {
    as: 'usuario',
    foreignKey: 'usuarioId'
})

//usuario puede crear modelos, pero hay modelos que no tienen usuarios
db.usuario.hasMany(db.modelo, {
    as: 'modelos',
    foreignKey: 'usuarioId'
})
db.modelo.belongsTo(db.usuario, {
    as: 'usuario',
    foreignKey: 'usuarioId'
})

//usuario puede crear grupos, pero hay grupos que no tienen usuarios
db.usuario.hasMany(db.grupo, {
    as: 'grupos',
    foreignKey: 'usuarioId'
})
db.grupo.belongsTo(db.usuario, {
    as: 'usuario',
    foreignKey: 'usuarioId'
})

const init = async () => {
    try {
        await sequelize.sync()
        console.log('Database synchronized')
    } catch (error) {
        console.error('Error synchronizing database:', error)
    }
}

init()

module.exports = db
