const express = require('express');

const app = express();

// Importando app de Routes
const usuarioRoute = require('./../routes/usuario').app;
const loginRoute = require('./../routes/login').app;
const categoriaRoute = require('./../routes/categoria').app;
const productoRoute = require('./../routes/producto').app;
const uploadRoute = require('./../routes/upload').app;
const imagenesRoute = require('./../routes/imagenes').app;

// Usando Middleware USE en Routes
app.use('/imagen', imagenesRoute);
app.use('/upload', uploadRoute);
app.use('/producto', productoRoute);
app.use('/categoria', categoriaRoute);
app.use('/usuario', usuarioRoute);
app.use('/login', loginRoute);

module.exports = {
    app
}