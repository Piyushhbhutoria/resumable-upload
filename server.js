let http = require('http')
let static = require('node-static')
let fileServer = new static.Server('.')
let path = require('path')
let fs = require('fs')

let uploads = Object.create(null)

function onUpload(req, res) {

  let fileId = req.headers['x-file-id']
  let startByte = +req.headers['x-start-byte']

  if (!fileId) {
    res.writeHead(400, "No file id")
    res.end()
  }

  // we'll files "nowhere"
  // let filePath = '/dev/null'
  // could use a real path instead, e.g.
  let filePath = path.join('tmp', fileId)
  console.log(filePath)

  // initialize a new upload
  if (!uploads[fileId]) uploads[fileId] = {}
  let upload = uploads[fileId]


  let fileStream

  // if startByte is 0 or not set, create a new file, otherwise check the size and append to existing one
  if (!startByte) {
    upload.bytesReceived = 0
    fileStream = fs.createWriteStream(filePath, {
      flags: 'w'
    })
  } else {
    // we can check on-disk file size as well to be sure
    if (upload.bytesReceived != startByte) {
      res.writeHead(400, "Wrong start byte")
      res.end(upload.bytesReceived)
      return
    }
    // append to existing file
    fileStream = fs.createWriteStream(filePath, {
      flags: 'a'
    })
  }


  req.on('data', function (data) {
    upload.bytesReceived += data.length
  })

  // send request body to file
  req.pipe(fileStream)

  // when the request is finished, and all its data is written
  fileStream.on('close', function () {
    if (upload.bytesReceived == req.headers['x-file-size']) {
      delete uploads[fileId]

      // can do something else with the uploaded file here
      console.log('file uploaded succesfully')
      res.end("Success " + upload.bytesReceived)
    } else {
      // connection lost, we leave the unfinished file around
      res.end()
    }
  })

  // in case of I/O error - finish the request
  fileStream.on('error', function (err) {
    res.writeHead(500, "File error")
    res.end()
  })

}

function onStatus(req, res) {
  let fileId = req.headers['x-file-id']
  let upload = uploads[fileId]
  if (!upload) {
    res.end("0")
  } else {
    res.end(String(upload.bytesReceived))
  }
}



// -----------------------------------

var express = require('express')
var cors = require('cors')
var app = express()

app.use(cors())
app.use("/static", express.static('./static/'))

app.get('/status', function (req, res, next) {
  // res.json({ msg: 'This is CORS-enabled for all origins!' })
  onStatus(req, res)
})

app.post('/upload', function (req, res, next) {
  // res.json({ msg: 'This is CORS-enabled for all origins!' })
  onUpload(req, res)
})

app.get('/', function (req, res, next) {
  // res.json({ msg: 'This is CORS-enabled for all origins!' })
  fileServer.serve(req, res)
})

app.listen(8080, function () {
  console.log('CORS-enabled web server listening on port 8080')
})
