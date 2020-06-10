// Routes.js - Módulo de rutas
var express = require('express');
var router = express.Router();

const mensajes = [
  {_id: 'xxx', user: 'Chicken', mensaje: 'Hola Mundo'},
  {_id: 'xxx', user: 'Donkey', mensaje: 'Hola Mundo'},
  {_id: 'xxx', user: 'Crab', mensaje: 'Hola Mundo'},
  //{_id: 'xxx', user: 'Frog', mensaje: 'Hola Mundo'}


]

// Get mensajes
router.get('/', function (req, res) {
  // res.json('Obteniendo mensajes');
  res.status(200).json( mensajes );
});

router.post('/', function(req, res) {
  console.log(req.body);
  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user
  }

  mensajes.push( mensaje );
  console.log(mensajes);
  res.json({
    ok:true,
    mensaje
  })
})

module.exports = router;