module.exports = {
    isRequestValid: (requiredFields, body, res) => {
        const missingFields = []
        for (const field of requiredFields) {
            if (!body[field]) {
                missingFields.push(field)
            }
        }
        if (missingFields.length > 0) {
            res.status(400).json({
                msg: `Faltan los campos: ${missingFields.join(', ')}`
            })
            return false
        }
        return true
    },
    sendError500: (error, res) => {
        console.log('Error', error)
        res.status(500).json({
            msg: 'Error en el servidor'
        })
    }
}
