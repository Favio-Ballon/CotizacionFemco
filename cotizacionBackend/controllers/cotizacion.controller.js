const db = require('../models')
const { isRequestValid } = require('../utils/request.utils')

exports.listCotizacion = (req, res) => {
    db.cotizacion
        .findAll()
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
            include: 'productos'
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
        'total',
        'tiempoEntrega',
        'transporte',
        'productos'
    ]

    if (!isRequestValid(requiredFields, req.body, res)) {
        return
    }

    const fechaToday = new Date()

    const cotizacion = {
        usuarioId: req.body.usuarioId,
        nombre: req.body.nombre,
        total: req.body.total,
        fecha: fechaToday,
        descuento: req.body.descuento ?? 0,
        formaPago: req.body.formaPago ?? 'credito',
        tiempoEntrega: req.body.tiempoEntrega ?? 'credito',
        transporte: req.body.transporte
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
        'total',
        'tiempoEntrega',
        'transporte',
        'productos'
    ]

    if (!isRequestValid(requiredFields, req.body, res)) {
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
        cotizacion.descuento = req.body.descuento
        cotizacion.formaPago = req.body.formaPago
        cotizacion.tiempoEntrega = req.body.tiempoEntrega
        cotizacion.transporte = req.body.transporte

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
            through: { cantidad: productoId[1] }
        })
    })
}

async function updateProductos(cotizacionId, productoIds) {
    const cotizacion = await db.cotizacion.findByPk(cotizacionId)

    await cotizacion.removeProductos()

    productoIds.forEach(async (productoId) => {
        const producto = await db.producto.findByPk(productoId[0])
        cotizacion.addProducto(producto, {
            through: { cantidad: productoId[1] }
        })
    })
}


