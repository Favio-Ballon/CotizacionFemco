const db = require('../models')
const { isRequestValid } = require('../utils/request.utils')

exports.listProducto = (req, res) => {
    db.producto
        .findAll({
            include: 'modelo'
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
        .findByPk(id)
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
        usuarioId: req.body.usuarioId ?? null,
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
                    `Ocurrió un error al actualizar el producto con id ${id}.`
            })
        })
}

exports.deleteProducto = async (req, res) => {
    const catalogo = req.params.id

    const producto = await db.producto.findByPk(catalogo)

    if (!producto) {
        res.status(404).send({
            message: `No se encontró el producto con id ${id}.`
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
                    `Ocurrió un error al eliminar el producto con id ${id}.`
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
            nombre: req.body.modelo
        }
    })

    if (!modeloId) {
        //create new model
        const modelo = {
            nombre: req.body.modelo,
            unidad: 'pzs'
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
        usuarioId: req.body.usuarioId ?? null,
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
