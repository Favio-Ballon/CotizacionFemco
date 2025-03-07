const db = require('../models')
const { isRequestValid } = require('../utils/request.utils')

exports.listCotizacion = (req, res) => {
    db.cotizacion
        .findAll(
            {
                order: [['id', 'DESC']],
            }
        )
        .then((data) => {
            res.send(data)
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Ocurrió un error al obtener las cotizaciones.'
            })
        })
}

exports.listCotizacionById = (req, res) => {
    const id = req.params.id

    db.cotizacion
        .findByPk(id, {
            include: [
                {
                    association: 'productos',
                    include: ['modelo'],
                    through: { attributes: ['cantidad', 'item'] }
                },
                'usuario'
            ],
            order: [['productos', db.productoCotizacion, 'item', 'ASC']]
        })
        .then((data) => {
            if (data) {
                res.send(data)
            } else {
                res.status(404).send({
                    message: `No se encontró la cotización con id ${id}.`
                })
            }
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    `Ocurrió un error al obtener la cotización con id ${id}.`
            })
        })
}

exports.createCotizacion = async (req, res) => {
    const requiredFields = [
        'nombre',
        'referencia',
        'total',
        'subtotal',
        'formaPago',
        'tiempoEntrega',
        'productos'
    ]

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    //check for imagen foto
    if (req.body.productos.length === 0) {
        res.status(400).send({
            message: 'La cotización debe contener al menos un producto.'
        })
        return
    }

    const fechaToday = new Date()

    const cotizacion = {
        usuarioId: req.user.id ?? null,
        nombre: req.body.nombre,
        total: req.body.total,
        fecha: fechaToday,
        descuento: req.body.descuento ?? 0,
        formaPago: req.body.formaPago ?? '100',
        tiempoEntrega: req.body.tiempoEntrega ?? '3-5',
        transporte: req.body.transporte ?? false,
        referencia: req.body.referencia,
        observaciones: req.body.observaciones ?? '',
        agregado: req.body.agregado ?? 0,
        subtotal: req.body.subtotal
    }

    try {
        const newCotizacion = await db.cotizacion.create(cotizacion)
        // Associate productos with the new cotizacion through productoCotizacion
        if (req.body.productos && req.body.productos.length > 0) {
            await setProductos(newCotizacion.id, req.body.productos)
        }

        res.send(newCotizacion)
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Ocurrió un error al crear la cotización.'
        })
    }
}

exports.updateCotizacion = async (req, res) => {
    const id = req.params.id

    const requiredFields = [
        'nombre',
        'referencia',
        'total',
        'subtotal',
        'formaPago',
        'tiempoEntrega',
        'productos'
    ]

    if (!isRequestValid(requiredFields, req.body, res)) {
        console.log('invalid request')
        return
    }

    try {
        const cotizacion = await db.cotizacion.findByPk(id)

        if (!cotizacion) {
            res.status(404).send({
                message: `No se encontró la cotización con id ${id}.`
            })
            return
        }
        cotizacion.nombre = req.body.nombre
        cotizacion.total = req.body.total
        cotizacion.descuento = req.body.descuento ?? 0
        cotizacion.formaPago = req.body.formaPago
        cotizacion.tiempoEntrega = req.body.tiempoEntrega
        cotizacion.transporte = req.body.transporte ?? false
        cotizacion.referencia = req.body.referencia
        cotizacion.observaciones = req.body.observaciones ?? ''
        cotizacion.agregado = req.body.agregado ?? 0
        cotizacion.subtotal = req.body.subtotal

        await cotizacion.save()

        // Associate productos with the updated cotizacion
        if (req.body.productos && req.body.productos.length > 0) {
            await updateProductos(cotizacion.id, req.body.productos)
        }

        res.status(200).send(cotizacion)
    } catch (err) {
        res.status(500).send({
            message:
                err.message ||
                `Ocurrió un error al actualizar la cotización con id ${id}.`
        })
    }
}

exports.deleteCotizacion = async (req, res) => {
    const id = req.params.id

    const cotizacion = await db.cotizacion.findByPk(id)

    if (!cotizacion) {
        res.status(404).send({
            message: `No se encontró la cotización con id ${id}.`
        })
        return
    } else {
        await cotizacion.destroy()
        res.status(204).json()
    }
}

async function setProductos(cotizacionId, productoIds) {
    const cotizacion = await db.cotizacion.findByPk(cotizacionId)
    productoIds.forEach(async (productoId) => {
        const producto = await db.producto.findByPk(productoId[0])
        cotizacion.addProducto(producto, {
            through: { cantidad: productoId[1], item: productoId[2] }
        })
    })
}

async function updateProductos(cotizacionId, productoIds) {
    const cotizacion = await db.cotizacion.findByPk(cotizacionId, {
        include: ['productos']
    })

    console.log('Attempting to remove productos')
    await cotizacion
        .removeProductos(cotizacion.productos)
        .then(() => {
            console.log('Productos removed successfully')
        })
        .catch((error) => {
            console.error('Error removing productos:', error)
        })

    console.log(productoIds, 'productoIds')

    productoIds.forEach(async (productoId) => {
        const producto = await db.producto.findByPk(productoId[0])
        cotizacion.addProducto(producto, {
            through: { cantidad: productoId[1], item: productoId[2] }
        })
    })
}

exports.addOrUpdateImage = async (req, res) => {
    console.log(req.files)
    const id = req.params.id
    const cotizacion = await db.cotizacion.findByPk(id)

    if (!cotizacion) {
        res.status(404).send({
            message: `No se encontró la cotización con id ${id}.`
        })
        return
    }

    if (!req.files) {
        res.status(400).send({
            message: 'No se encontró la imagen.'
        })
        return
    }

    uploadImage(req, res, cotizacion)
}

const path = require('path')

function uploadImage(req, res, cotizacion) {
    const file = req.files.imagen
    const uploadPath = path.resolve(
        __dirname,
        '../uploads/cotizacion',
        `${cotizacion.id}.${file.name.split('.').pop()}`
    )

    file.mv(uploadPath, (err) => {
        if (err) {
            res.status(500).send({
                message: 'Error al subir la imagen.'
            })
            return
        }

        cotizacion.imagen = `${cotizacion.id}.${file.name.split('.').pop()}`
        cotizacion.save()
        res.status(200).send()
    })
}

exports.dashboardFacturas = async (req, res) => {
    try {
        console.log(req.body);
        const response = await fetch(
            `http://181.177.141.171/pos/bin/modelo.php`,
            {
                headers: {
                    Cookie: `PHPSESSID=${req.body.PHPSESSID};`
                },
                method: 'POST',
                body: JSON.stringify({
                    accion: 109,
                    usuario: req.body.usuario,
                    tipo: 'DFA',
                    inicio: req.body.inicio,
                    fin: req.body.fin
                })
            }
        )
        const facturas = await response.json()
        console.log(facturas)
        res.send(facturas)
    } catch (err) {
        console.log(err)
        res.status(500).send({
            message: err.message || 'Ocurrió un error al obtener las facturas.'
        })
    }
}
