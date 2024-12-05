const express = require('express');
const router = express.Router();
const { ventasDb } = require('../db/database'); // Importa la conexión a la base de datos de ventas.

router.get('/corte', (req, res) => {
    const today = new Date().toISOString().split('T')[0]; // Obtener la fecha en formato YYYY-MM-DD.

    ventasDb.all(
        `SELECT product_name, quantity, (quantity * total_amount) AS total, sale_date
         FROM ventas
         WHERE DATE(sale_date) = ?`,
        [today],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al generar el corte de caja' });
            }

            const total = rows.reduce((sum, transaction) => sum + transaction.total, 0);
            res.json({ total, transactions: rows });
        }
    );
});

module.exports = router;
