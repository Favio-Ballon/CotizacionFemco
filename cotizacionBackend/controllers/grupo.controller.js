const db = require('../models')
const { isRequestValid } = require('../utils/request.utils')

exports.listGrupo = (req, res) => {
    db.grupo
        .findAll()
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
