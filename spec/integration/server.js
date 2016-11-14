var express = require('express')
var bodyParser = require('body-parser')

var app = new express()
var responses = require('./responses')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
  console.log(req.method.toUpperCase() + ' ' + req.path + ', Body: ' + JSON.stringify(req.body) + ', Headers: ' + JSON.stringify(req.headers) + '\n')
  next()
})

app.get('/api/books.json', function(req, res) {
  res.set({ 'X-Api-Response': 'apiBooks' })
  res.send(responses.apiBooks)
})

app.get('/api/books/:id.json', function(req, res) {
  res.set({ 'X-Api-Response': 'apiBooksById' })
  res.set({ 'X-Param-Id': req.params.id })
  res.send(responses.apiBooksById)
})

app.get('/api/plain-text', function(req, res) {
  res.set({ 'X-Api-Response': 'apiPlainText' })
  res.send(responses.apiPlainText)
})

app.post('/api/pictures/:category', function(req, res) {
  res.set({ 'X-Api-Response': 'apiPicturesCreate' })
  res.set({ 'X-Param-Category': req.params.category })
  res.set({ 'X-Body': JSON.stringify(req.body) })
  res.send(responses.apiPicturesCreate)
})

app.put('/api/pictures/:category', function(req, res) {
  res.set({ 'X-Api-Response': 'apiPicturesAdd' })
  res.set({ 'X-Param-Category': req.params.category })
  res.set({ 'X-Body': JSON.stringify(req.body) })
  res.send(responses.apiPicturesAdd)
})

app.listen(9090, function() {
  console.log('Integration backend listening on port 9090')
})
