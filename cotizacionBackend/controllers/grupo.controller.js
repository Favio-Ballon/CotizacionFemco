const db = require('../models')
const { isRequestValid } = require('../utils/request.utils')

exports.listGrupo = (req, res) => {
    db.grupo
        .findAll({
            include: 'productos'
        })
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || 'Ocurrió un error al obtener los grupos.'
            })
        })
}

exports.listGrupoById = (req, res) => {
    const id = req.params.id

    db.grupo
        .findByPk(id)
        .then((data) => {
            if (data) {
                res.send(data)
            } else {
                res.status(404).send({
                    message: `No se encontró el grupo con id ${id}.`
                })
            }
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al obtener el grupo con id ${id}.`
            })
        })
}

exports.createGrupo = async (req, res) => {
    const requiredFields = ['nombre']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const grupo = {
        nombre: req.body.nombre,
        usuarioId: req.body.usuarioId ?? null
    }

    db.grupo
        .create(grupo)
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Ocurrió un error al crear el grupo.'
            })
        })
}

exports.updateGrupo = async (req, res) => {
    const id = req.params.id

    const requiredFields = ['nombre']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const grupo = await db.grupo.findByPk(id)

    if (!grupo) {
        res.status(404).send({
            message: `No se encontró el grupo con id ${id}.`
        })
        return
    }

    grupo.nombre = req.body.nombre
    if (req.body.usuarioId) grupo.usuarioId = req.body.usuarioId

    grupo
        .save()
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al actualizar el grupo con id ${id}.`
            })
        })
}

exports.deleteGrupo = async (req, res) => {
    const id = req.params.id

    const grupo = await db.grupo.findByPk(id)

    if (!grupo) {
        res.status(404).send({
            message: `No se encontró el grupo con id ${id}.`
        })
        return
    }

    grupo
        .destroy()
        .then(() => {
            res.send({
                message: 'Grupo eliminado exitosamente.'
            })
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al eliminar el grupo con id ${id}.`
            })
        })
}

exports.createGrupoConProductos = async (req, res) => {
    const requiredFields = ['nombre', 'productos']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const grupo = {
        nombre: req.body.nombre,
        usuarioId: req.user.id ?? null
    }

    db.grupo
        .create(grupo)
        .then(async (grupo) => {
            //the productos array is an array of product ids with the names to create through producto_grupo
            const productos = req.body.productos
            const grupoId = grupo.id

            console.log(productos)
            for (let i = 0; i < productos.length; i++) {
                const producto = productos[i]
                const productoId = producto.catalogo
                const productoNombre = producto.nombre

                const productoGrupo = {
                    catalogo: productoId,
                    nombre: productoNombre,
                    grupoId: grupoId
                }
                await db.productoGrupo.create(productoGrupo)
            }

            res.send(grupo)
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send({
                message: err.message || 'Ocurrió un error al crear el grupo.'
            })
        })
}

exports.updateGrupoConProductos = async (req, res) => {
    const id = req.params.id

    const requiredFields = ['nombre', 'productos']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const grupo = await db.grupo.findByPk(id)

    if (!grupo) {
        res.status(404).send({
            message: `No se encontró el grupo con id ${id}.`
        })
        return
    }

    grupo.nombre = req.body.nombre
    if (req.body.usuarioId) grupo.usuarioId = req.body.usuarioId

    await grupo.save()

    //delete all productos from producto_grupo
    await db.productoGrupo.destroy({
        where: {
            grupoId: id
        }
    })

    //create new productos
    const productos = req.body.productos
    for (let i = 0; i < productos.length; i++) {
        const producto = productos[i]
        const productoId = producto.catalogo
        const productoNombre = producto.nombre

        const productoGrupo = {
            catalogo: productoId,
            nombre: productoNombre,
            grupoId: id
        }
        await db.productoGrupo.create(productoGrupo)
    }

    res.send(grupo)
}
