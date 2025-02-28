require('dotenv').config()
const express = require('express')
var cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const fileUpload = require('express-fileupload')
const { exec } = require('child_process')

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)

var corsOptions = {
    origin: [
        'https://www.cotizafemco.com',
        /\.cotizafemco\.com$/,
        'https://github.com',
        'http://localhost:5173'
    ] // Allow frontend & GitHub
}

app.use(cors(corsOptions))

app.use(express.static('public'))

app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 }
    })
)

const db = require('./models')
db.sequelize
    .sync({
        //force: true, // drop tables and recreate
    })
    .then(() => {
        console.log('db resync')
    })

require('./routes')(app)

//make static files available
app.use('/uploads/cotizacion', express.static('uploads/cotizacion'))

app.use('/uploads/firmas', express.static('uploads/firmas'))

app.post('/webhook', (req, res) => {
    console.log('Webhook received from GitHub')

    exec(
        'C:\\Users\\59179\\Documents\\web\\CotizacionFemco\\deploy.bat',
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`)
                return res.status(500).send('Deployment failed')
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`)
                return res.status(500).send('Deployment error')
            }

            console.log(`stdout: ${stdout}`)
            res.status(200).send('Deployment successful')
        }
    )
})

app.listen(3000, '0.0.0.0', function () {
    console.log('Ingrese a http://localhost:3000')
})
