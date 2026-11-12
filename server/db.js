const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(path.join(__dirname, 'inventario.db'), (err) => {
    if (err) console.error('Error al conectar con la base de datos:', err.message);
});

function initializeDatabase(callback) {
    const schemaPath = path.resolve(__dirname, '..', 'schema.sql');

    fs.readFile(schemaPath, 'utf8', (readError, schema) => {
        if (readError) {
            callback(readError);
            return;
        }

        db.exec(schema, callback);
    });
}

module.exports = { db, initializeDatabase };