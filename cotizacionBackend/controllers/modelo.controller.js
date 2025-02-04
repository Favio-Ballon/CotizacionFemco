const db = require('../models')
const { isRequestValid } = require('../utils/request.utils')

exports.listModelo = (req, res) => {
    db.modelo
        .findAll()
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || 'Ocurrió un error al obtener los modelos.'
            })
        })
}

exports.listModeloById = (req, res) => {
    const id = req.params.id

    db.modelo
        .findByPk(id, {
            include: 'productos'
        })
        .then((data) => {
            if (data) {
                res.send(data)
            } else {
                res.status(404).send({
                    message: `No se encontró el modelo con id ${id}.`
                })
            }
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al obtener el modelo con id ${id}.`
            })
        })
}

exports.createModelo = async (req, res) => {
    const requiredFields = ['nombre']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const modelo = {
        nombre: req.body.nombre,
        unidad: req.body.unidad ?? 'pzs',
        usuarioId: req.body.usuarioId ?? null
    }

    db.modelo
        .create(modelo)
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Ocurrió un error al crear el modelo.'
            })
        })
}

exports.updateModelo = async (req, res) => {
    const id = req.params.id

    const requiredFields = ['nombre']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const model = await db.modelo.findByPk(id)

    if (!model) {
        res.status(404).send({
            message: `No se encontró el modelo con id ${id}.`
        })
        return
    }

    model.nombre = req.body.nombre
    if (req.body.unidad) model.unidad = req.body.unidad

    model
        .save()
        .then(() => {
            res.send(model)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al actualizar el modelo con id ${id}.`
            })
        })
}

exports.deleteModelo = async (req, res) => {
    const id = req.params.id

    const model = await db.modelo.findByPk(id)

    if (!model) {
        res.status(404).send({
            message: `No se encontró el modelo con id ${id}.`
        })
        return
    }

    model
        .destroy()
        .then(() => {
            res.send({
                message: `El modelo con id ${id} fue eliminado exitosamente.`
            })
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al eliminar el modelo con id ${id}.`
            })
        })
}
