const db = require('../models')
const { isRequestValid } = require('../utils/request.utils')

exports.listProducto = (req, res) => {
    db.producto
        .findAll({
            include: 'modelo',
            where: {
                usuarioId: req.user.id
            }
        })
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || 'Ocurrió un error al obtener los productos.'
            })
        })
}

exports.listProductoById = (req, res) => {
    const id = req.params.id

    db.producto
        .findByPk(id, {
            where: {
                usuarioId: req.user.id
            }
        })
        .then((data) => {
            if (data) {
                res.send(data)
            } else {
                res.status(404).send({
                    message: `No se encontró el producto con id ${id}.`
                })
            }
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al obtener el producto con id ${id}.`
            })
        })
}

exports.createProducto = async (req, res) => {
    const requiredFields = ['catalogo', 'nombre', 'precio', 'modeloId']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const producto = {
        catalogo: req.body.catalogo,
        nombre: req.body.nombre,
        precio: req.body.precio,
        modeloId: req.body.modeloId,
        usuarioId: req.user.id ?? null,
        esTemporal: req.body.esTemporal ?? false
    }

    console.log(producto)
    db.producto
        .create(producto)
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Ocurrió un error al crear el producto.'
            })
        })
}

exports.updateProducto = async (req, res) => {
    const catalogo = req.params.id

    const requiredFields = ['nombre', 'precio', 'modeloId']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const producto = await db.producto.findByPk(catalogo)

    if (!producto) {
        res.status(404).send({
            message: `No se encontró el producto con id ${catalogo}.`
        })
        return
    }

    producto.nombre = req.body.nombre
    producto.precio = req.body.precio
    producto.modeloId = req.body.modeloId

    producto
        .save()
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al actualizar el producto con id ${catalogo}.`
            })
        })
}

exports.deleteProducto = async (req, res) => {
    const catalogo = req.params.id

    const producto = await db.producto.findByPk(catalogo)

    if (!producto) {
        res.status(404).send({
            message: `No se encontró el producto con id ${catalogo}.`
        })
        return
    }

    producto
        .destroy()
        .then(() => {
            res.send({
                message: 'Producto eliminado exitosamente.'
            })
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al eliminar el producto con id ${catalogo}.`
            })
        })
}

exports.createProductoWeb = async (req, res) => {
    const requiredFields = ['catalogo', 'nombre', 'precio', 'modelo']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    // Buscar modelo it doesnt matter if it is a new model or an existing one, and isnt case sensitive
    const modeloId = await db.modelo.findOne({
        where: {
            nombre: req.body.modelo,
            usuarioId: req.user.id ?? null
        }
    })

    if (!modeloId) {
        //create new model
        const modelo = {
            nombre: req.body.modelo,
            unidad: 'pzs',
            usuarioId: req.user.id ?? null
        }

        const newModelo = await db.modelo.create(modelo)
        req.body.modeloId = newModelo.id
    } else {
        req.body.modeloId = modeloId.id
    }

    const producto = {
        catalogo: req.body.catalogo,
        nombre: req.body.nombre,
        precio: req.body.precio,
        modeloId: req.body.modeloId,
        usuarioId: req.user.id ?? null,
        esTemporal: req.body.esTemporal ?? false
    }

    db.producto
        .create(producto)
        .then((data) => {
            //devolver con modelo
            db.producto
                .findByPk(data.catalogo, {
                    include: 'modelo'
                })
                .then((data) => {
                    res.send(data)
                })
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Ocurrió un error al crear el producto.'
            })
        })
}

exports.updateProductoWeb = async (req, res) => {
    const catalogo = req.params.id

    const requiredFields = ['nombre', 'precio', 'modelo']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const producto = await db.producto.findByPk(catalogo)

    if (!producto) {
        res.status(404).send({
            message: `No se encontró el producto con id ${catalogo}.`
        })
        return
    }

    // Buscar modelo it doesnt matter if it is a new model or an existing one, and isnt case sensitive
    const modeloId = await db.modelo.findOne({
        where: {
            nombre: req.body.modelo
        }
    })

    if (!modeloId) {
        //create new model
        const modelo = {
            nombre: req.body.modelo,
            unidad: 'pzs',
            usuarioId: req.user.id ?? null
        }

        const newModelo = await db.modelo.create(modelo)
        req.body.modeloId = newModelo.id
    } else {
        req.body.modeloId = modeloId.id
    }

    producto.nombre = req.body.nombre
    producto.precio = req.body.precio
    producto.modeloId = req.body.modeloId

    producto
        .save()
        .then((data) => {
            //devolver con modelo
            db.producto
                .findByPk(data.catalogo, {
                    include: 'modelo'
                })
                .then((data) => {
                    res.send(data)
                })
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al actualizar el producto con id ${catalogo}.`
            })
        })
}

const { sequelize } = require('../models')

exports.createProductoTemporal = async (req, res) => {
    const requiredFields = ['nombre', 'precio', 'modelo']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    // Buscar modelo it doesnt matter if it is a new model or an existing one, and isnt case sensitive
    const modeloId = await db.modelo.findOne({
        where: {
            nombre: req.body.modelo
        }
    })
    await sequelize
        .transaction(async (t) => {
            if (!modeloId) {
                //create new model
                const modelo = {
                    nombre: req.body.modelo,
                    unidad: 'pzs',
                    usuarioId: req.user.id ?? null
                }

                const newModelo = await db.modelo.create(modelo, {
                    transaction: t
                })
                req.body.modeloId = newModelo.id
            } else {
                req.body.modeloId = modeloId.id
            }

            // Se configrma que el catalogo sea autoincremental
            const maxCatalogo = await db.producto.max('catalogo', {
                transaction: t
            })
            console.log('Max catalogo:', maxCatalogo)
            if (maxCatalogo) {
                await sequelize.query(
                    `ALTER TABLE productos AUTO_INCREMENT = ${maxCatalogo + 1}`,
                    { transaction: t }
                )
            }

            const producto = {
                nombre: req.body.nombre,
                precio: req.body.precio,
                modeloId: req.body.modeloId,
                usuarioId: req.user.id ?? null,
                esTemporal: true
            }

            await db.producto
                .create(producto, { transaction: t })
                .then((data) => {
                    const producto = {
                        catalogo: data.catalogo,
                        nombre: data.nombre,
                        precio: data.precio,
                        modelo: {
                            nombre: req.body.modelo
                        }
                    }
                    res.status(201).send(producto)
                })
        })
        .then(() => {
            console.log('Producto creado exitosamente')
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send({
                message: err.message || 'Ocurrió un error al crear el producto.'
            })
        })
}
