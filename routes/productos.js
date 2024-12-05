const express = require('express');
//const db = require('../db/database'); // Conexión a la base de datos principal (productos)
const { db, ventasDb } = require('../db/database'); // Conexión a la base de datos secundaria (ventas)
const { handleError } = require('../utils/errorHandler');

const router = express.Router();

// Endpoint para registrar un nuevo producto
router.post('/insert', (req, res) => {
  const { product_name, price, quantity } = req.body;

  const stmt = db.prepare('INSERT INTO productos (product_name, price, quantity) VALUES (?, ?, ?)');
  stmt.run(product_name, price, quantity, function (err) {
    if (err) {
      return handleError(res, 'Error al insertar producto', 500, err);
    }
    res.send('Producto registrado correctamente');
  });
  stmt.finalize();
});

// Endpoint para obtener todos los productos
router.get('/getAll', (req, res) => {
  db.all('SELECT * FROM productos', [], (err, rows) => {
    if (err) {
      return handleError(res, 'Error al consultar productos', 500, err);
    }
    res.json(rows);
  });
});

// Endpoint para eliminar un producto por su ID
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM productos WHERE id = ?', [id], function (err) {
    if (err) {
      return handleError(res, 'Error al eliminar producto', 500, err);
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  });
});

// Endpoint para ventas
router.post('/ventas', (req, res) => {
    const cart = req.body;
  
    db.serialize(() => {
      cart.forEach(({ product_name, quantity }) => {
        db.get('SELECT * FROM productos WHERE product_name = ?', [product_name], (err, product) => {
          if (err || !product || product.quantity < quantity) {
            return res.status(400).json({ error: `Stock insuficiente para ${product_name}` });
          }
  
          const saleDate = new Date().toISOString(); // Fecha y hora actual en formato ISO
          const totalAmount = product.price * quantity;
  
          // Actualizar stock en la base de datos principal
          db.run(
            `UPDATE productos
             SET quantity = quantity - ?, sale_date = ?
             WHERE product_name = ?`,
            [quantity, saleDate, product_name],
            (updateErr) => {
              if (updateErr) {
                return res.status(500).json({ error: 'Error al actualizar el stock' });
              }
            }
          );
  
          // Registrar la venta en la base de datos secundaria (ventas.db)
          ventasDb.run(
            `INSERT INTO ventas (product_name, quantity, sale_date, total_amount)
             VALUES (?, ?, ?, ?)`,
            [product_name, quantity, saleDate, totalAmount],
            function (insertErr) {
              if (insertErr) {
                console.error('Error al insertar venta en ventas.db:', insertErr.message);
                return res.status(500).json({ error: 'Error al registrar la venta en la base de datos secundaria' });
              }
              console.log(`Venta registrada correctamente en ventas.db con ID: ${this.lastID}`);
            }
          );
        });
      });
  
      res.json({ message: 'Venta procesada correctamente' });
    });
  });
  
// Endpoint Corte de caja
router.get('/corte', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato YYYY-MM-DD.

  db.all(
    `SELECT product_name, (quantity * -1) AS quantity_sold, (price * (quantity * -1)) AS total, sale_date
     FROM productos
     WHERE DATE(sale_date) = ? AND quantity < 0`,
    [today],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al generar el corte de caja' });
      }

      const total = rows.reduce((sum, row) => sum + row.total, 0);
      res.json({ total, transactions: rows });
    }
  );
});

module.exports = router;
