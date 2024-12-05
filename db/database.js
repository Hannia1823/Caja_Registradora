const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('caja_registradora.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err);
  } else {
    console.log('Base de datos conectada');
    db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      price REAL,
      quantity INTEGER
    )`);
  }
});

// Conexión a la base de datos secundaria (ventas.db)
const ventasDb = new sqlite3.Database('ventas.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos de ventas:', err);
  } else {
    console.log('Base de datos de ventas conectada');
    ventasDb.run(`CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      quantity INTEGER,
      sale_date TEXT,
      total_amount REAL
    )`);
  }
});

//module.exports = db, ventasDb;
module.exports = { db, ventasDb };
