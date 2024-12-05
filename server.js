const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const productosRouter = require('./routes/productos.js');
const cajaRoutes = require('./routes/caja');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para el menú
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Ruta para Inventario
app.get('/inventario', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/inventario.html'));
});

// Ruta para Ventas
app.get('/ventas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ventas.html'));
});

// Ruta para Consulta de Productos
app.get('/consulta', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/consulta.html'));
});


// Rutas
app.use('/api/productos', productosRouter);
app.use('/api/caja', cajaRoutes);
// Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

