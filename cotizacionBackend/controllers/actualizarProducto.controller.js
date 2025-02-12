const db = require('../models')
const XLSX = require('xlsx')
const { isRequestValid } = require('../utils/request.utils')

exports.actualizarProductos = async (req, res) => {
    try {
        console.log('entro a la funcion')
        if (!req.files.file)
            return res
                .status(400)
                .send('No se subió ningún archivo en la funcion.')

        // Leer el archivo Excel
        console.log('filePath', req.filePath)
        const workbook = XLSX.readFile(req.filePath)
        const sheetName = workbook.SheetNames[0]
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

        // Procesar las filas
        for (const row of data) {
            const { CAT_AUX, MODELO, DESCRIP, PVA, UNIDAD } = row

            // Buscar o crear el modelo
            const [modelo, created] = await db.modelo.findOrCreate({
                where: { nombre: MODELO },
                defaults: { unidad: UNIDAD, usuarioId: req.user.id }
            })

            // Buscar o actualizar el producto
            await db.producto.upsert({
                catalogo: CAT_AUX,
                nombre: DESCRIP,
                precio: PVA,
                esTemporal: false,
                modeloId: modelo.id,
                usuarioId: req.user.id
            })
        }

        res.send('Archivo procesado y datos actualizados correctamente.')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error al procesar el archivo.')
    }
}
