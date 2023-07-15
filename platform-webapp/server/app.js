const path = require('path')
const express = require('express')
const cors = require('cors')

//Load env variables
let envpath = path.join(__dirname, 'etc', '.env')
require('dotenv').config({ path: envpath })

const app = express()

const publicFilesDir = path.join(__dirname, 'public')

app.use(cors())
app.use(express.static(publicFilesDir))
app.use('*', function(req, res) {
  let indexPath = path.join(publicFilesDir, 'index.html')
  res.sendFile(indexPath)
})

app.listen(process.env.PORT, () => {
  console.log('-----------------------------------')
  console.log(`App running on port: ${process.env.PORT}`)
  console.log('-----------------------------------')
})
