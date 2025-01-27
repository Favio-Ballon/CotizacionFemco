const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

// Middleware para verificar autenticación
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        return res
            .status(401)
            .send({ message: 'No autorizado. Token no proporcionado.' })
    }

    const token = authHeader.split(' ')[1]
    if (!token || token.trim() === '') {
        return res
            .status(401)
            .send({ message: 'No autorizado. Token vacío o inválido.' })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) // Verifica el token
        req.user = decoded // Adjuntar el usuario decodificado a `req`
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res
                .status(401)
                .send({ message: 'No autorizado. Token expirado.' })
        }
        return res
            .status(401)
            .send({ message: 'No autorizado. Token inválido.' })
    }
}

const validarAdmin = (req, res, next) => {
    //se tiene que decodificar el token
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        return res
            .status(401)
            .send({ message: 'No autorizado. Token no proporcionado.' })
    }

    const token = authHeader.split(' ')[1]
    if (!token || token.trim() === '') {
        return res
            .status(401)
            .send({ message: 'No autorizado. Token vacío o inválido.' })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        if (req.user.admin) {
            next()
        } else {
            return res
                .status(403)
                .send({ message: 'No autorizado. Solo administradores.' })
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res
                .status(401)
                .send({ message: 'No autorizado. Token expirado.' })
        }
        return res
            .status(401)
            .send({ message: 'No autorizado. Token inválido.' })
    }
}

module.exports = authMiddleware
