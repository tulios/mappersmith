/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const upload = multer({ storage: multer.memoryStorage() })

const app = express()
const responses = require('./support/responses')

const CSRF_TOKEN = 'qwerty'

function extractRawBody(req, res, buf) {
  req.rawBody = buf.toString('utf-8')
}

app.use(cookieParser())
app.use(bodyParser.json({ verify: extractRawBody }))
app.use(bodyParser.urlencoded({ extended: true, verify: extractRawBody }))

app.use(function (req, res, next) {
  console.log(
    req.method.toUpperCase() +
      ' ' +
      req.path +
      ', RawBody: ' +
      req.rawBody +
      ', Body: ' +
      JSON.stringify(req.body) +
      ', Headers: ' +
      JSON.stringify(req.headers) +
      '\n'
  )
  next()
})

app.get('/api/books.json', function (req, res) {
  res.set({ 'X-Api-Response': 'apiBooks' })
  res.send(responses.apiBooks)
})

app.get('/api/books/:id.json', function (req, res) {
  res.set({ 'X-Api-Response': 'apiBooksById' })
  res.set({ 'X-Param-Id': req.params.id })
  res.send(responses.apiBooksById)
})

app.get('/api/plain-text', function (req, res) {
  res.set({ 'X-Api-Response': 'apiPlainText' })
  res.send(responses.apiPlainText)
})

app.post('/api/pictures/upload', upload.any(), function (req, res) {
  res.set({ 'X-Api-Response': 'apiPicturesUpload' })
  res.set({ 'X-Api-Content-Type': req.headers['content-type'] })
  res.set({ 'X-Api-files': JSON.stringify(req.files) })
  res.set({ 'X-Body': JSON.stringify(req.files) })
  res.send(responses.apiPicturesUpload)
})

app.post('/api/pictures/:category', function (req, res) {
  res.set({ 'X-Api-Response': 'apiPicturesCreate' })
  res.set({ 'X-Param-Category': req.params.category })
  res.set({ 'X-Body': JSON.stringify(req.body) })
  res.set({ 'X-Raw-Body': req.rawBody })
  res.send(responses.apiPicturesCreate)
})

app.put('/api/pictures/:category', function (req, res) {
  res.set({ 'X-Api-Response': 'apiPicturesAdd' })
  res.set({ 'X-Param-Category': req.params.category })
  res.set({ 'X-Body': JSON.stringify(req.body) })
  res.set({ 'X-Raw-Body': req.rawBody })
  res.send(responses.apiPicturesAdd)
})

app.get('/api/failure.json', function (req, res) {
  res.set({ 'X-Api-Response': 'apiFailure' })
  res.status(500)
  res.send(responses.apiFailure)
})

let number = 0
app.get('/api/fail-on-odd.json', function (req, res) {
  number++
  res.set({ 'X-Api-Response': 'apiFailOnOdd' })
  res.status(number % 2 === 0 ? 200 : 500)
  res.send(responses.apiFailOnOdd)
})

app.get('/api/secure.json', function (req, res) {
  res.set({ 'X-Api-Response': 'apiSecure' })
  res.set({ 'X-Header-Authorization': req.headers['authorization'] })
  res.send(responses.apiSecure)
})

app.get('/api/timeout.json', function (req, res) {
  res.set({ 'X-Api-Response': 'apiTimeout' })
  const waitTime = req.query.waitTime ? parseInt(req.query.waitTime, 10) : 100

  setTimeout(function () {
    res.send(responses.apiTimeout)
  }, waitTime)
})

app.get('/api/binary.pdf', function (req, res) {
  const pdf = fs.readFileSync(path.join(__dirname, './support/fixture/hello_world.pdf'))
  res.send(pdf)
})

app.get('/api/csrf', function (req, res) {
  res.cookie('csrfToken', CSRF_TOKEN, { httpOnly: false })
  res.sendStatus(200)
})

app.get('/api/csrf/test', function (req, res) {
  const csrfHeader = req.headers['x-csrf-token']
  const csrfCookie = req.cookies['csrfToken']
  res.cookie('csrfToken', CSRF_TOKEN, { httpOnly: false })
  res.sendStatus(csrfHeader === csrfCookie ? 200 : 403)
})

app.listen(9090, function () {
  console.log('Integration backend listening on port 9090')
})
