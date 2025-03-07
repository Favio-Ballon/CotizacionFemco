const db = require('../models')
const { isRequestValid } = require('../utils/request.utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')

exports.listUsuario = (req, res) => {
    db.usuario
        .findAll()
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || 'Ocurrió un error al obtener los usuarios.'
            })
        })
}

exports.listUsuarioById = (req, res) => {
    const id = req.params.id

    db.usuario
        .findByPk(id)
        .then((data) => {
            if (data) {
                res.send(data)
            } else {
                res.status(404).send({
                    message: `No se encontró el usuario con id ${id}.`
                })
            }
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al obtener el usuario con id ${id}.`
            })
        })
}

exports.createUsuario = async (req, res) => {
    const requiredFields = [
        'nombre',
        'apellido',
        'correo',
        'usuario',
        'contrasena',
        'telefono',
        'direccion'
    ]

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const usuario = {
        nombre: req.body.nombre,
        correo: req.body.correo,
        contrasena: bcrypt.hashSync(req.body.contrasena, 10),
        usuario: req.body.usuario,
        apellido: req.body.apellido,
        telefono: req.body.telefono,
        direccion: req.body.direccion,
        firma: req.body.firma ?? null
    }

    db.usuario
        .create(usuario)
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || 'Ocurrió un error al crear el usuario.'
            })
        })
}

exports.updateUsuario = async (req, res) => {
    const id = req.params.id

    const requiredFields = [
        'nombre',
        'apellido',
        'correo',
        'usuario',
        'telefono'
    ]

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const usuario = await db.usuario.findByPk(id)

    if (!usuario) {
        res.status(404).send({
            message: `No se encontró el usuario con id ${id}.`
        })
        return
    }

    usuario.nombre = req.body.nombre
    usuario.apellido = req.body.apellido
    usuario.correo = req.body.correo
    usuario.usuario = req.body.usuario
    usuario.telefono = req.body.telefono

    usuario
        .save()
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al actualizar el usuario con id ${id}.`
            })
        })
}

exports.deleteUsuario = async (req, res) => {
    const id = req.params.id

    const usuario = await db.usuario.findByPk(id)

    if (!usuario) {
        res.status(404).send({
            message: `No se encontró el usuario con id ${id}.`
        })
        return
    }

    usuario
        .destroy()
        .then(() => {
            res.send({
                message: `El usuario con id ${id} fue eliminado exitosamente.`
            })
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al eliminar el usuario con id ${id}.`
            })
        })
}

exports.login = async (req, res) => {
    const requiredFields = ['usuario', 'contrasena']

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const usuario = await db.usuario.findOne({
        where: { usuario: req.body.usuario }
    })

    if (!usuario) {
        res.status(404).send({
            message: 'Usuario no encontrado.'
        })
        return
    }

    const contrasenaValida = bcrypt.compareSync(
        req.body.contrasena,
        usuario.contrasena
    )

    if (!contrasenaValida) {
        res.status(401).send({
            message: 'Contraseña incorrecta.'
        })
        return
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            nombre: usuario.nombre + ' ' + usuario.apellido,
            correo: usuario.correo
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    )

    res.send({
        usuario: usuario,
        token: token
    })
}

exports.uploadFirma = async (req, res) => {
    const id = req.user.id

    const usuario = await db.usuario.findByPk(id)

    if (!usuario) {
        res.status(404).send({
            message: `No se encontró el usuario con id ${id}.`
        })
        return
    }

    const firma = uploadFirmaImagen(req, res)

    usuario.firma = firma

    usuario
        .save()
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al actualizar el usuario con id ${id}.`
            })
        })
}

const uploadFirmaImagen = (req, res) => {
    if (req.files) {
        console.log(req.files)
        const file = req.files.firma
        const extension = file.name.split('.').pop()
        const fileName = req.user.id + '.' + extension
        console.log(fileName)
        const path = `./uploads/firmas/${fileName}`

        if (!fs.existsSync('./uploads/firmas')) {
            fs.mkdirSync('./uploads/firmas')
        }

        file.mv(path, (err) => {
            if (err) {
                console.error(err)
                res.status(500).send({
                    message: 'Ocurrió un error al subir la firma.'
                })
            }
        })

        return fileName
    }
}

exports.getPHPSESSID = async (req, res) => {
    try {
        const response = await fetch(
            `http://181.177.141.171/pos/bin/modelo.php`,
            {
                method: 'POST',
                body: JSON.stringify({
                    accion: 24,
                    usr: 'Ventas-SP',
                    pswd: 'VSP5370',
                    middleware: 'Femco',
                    url: 'http://localhost:80/Femco/api/web/',
                    base: 'pos_1',
                    equipo: 'VENTAS-SP1'
                }),
                credentials: 'include'
            }
        )
        const cookies = response.headers.get('set-cookie')
        const match = cookies.match(/PHPSESSID=([^;]+);/)
        const PHPSESSID = match ? match[1] : null
        console.log(PHPSESSID)
        res.send({ PHPSESSID })
    } catch (err) {
        console.log(err)
        res.status(500).send({
            message: err.message || 'Ocurrió un error al obtener las facturas.'
        })
    }
}
