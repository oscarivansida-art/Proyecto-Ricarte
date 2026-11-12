const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initializeDatabase } = require('./db');

const app = express();
const PORT = 3000;
const projectRoot = path.resolve(__dirname, '..');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(projectRoot, 'index.html'));
});

['css', 'js', 'admin', 'encargado'].forEach((directory) => {
    app.use(`/${directory}`, express.static(path.join(projectRoot, directory)));
});

// --- API ENDPOINT 1: INICIO DE SESIÓN ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = `
        SELECT u.id, u.nombre, u.email, u.password_hash, r.nombre AS role 
        FROM usuarios u
        JOIN roles r ON u.rol_id = r.id
        WHERE u.email = ?
    `;

    db.get(query, [email], (err, user) => {
        if (err) return res.status(500).json({ error: "Error de servidor" });
        if (!user || user.password_hash !== password) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        res.json({
            id: user.id,
            name: user.nombre,
            email: user.email,
            role: user.role
        });
    });
});

// --- API ENDPOINT 2: OBTENER INVENTARIO DE PRODUCTOS ---
app.get('/api/productos', (req, res) => {
    db.all("SELECT * FROM productos", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/productos', (req, res) => {
    const { codigo, nombre, categoria, stock, precio, ubicacion } = req.body;
    const codigoLimpio = typeof codigo === 'string' ? codigo.trim() : '';
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
    const categoriaLimpia = typeof categoria === 'string' ? categoria.trim() : '';
    const stockInicial = typeof stock === 'string' && stock.trim() === '' ? NaN : Number(stock);
    const precioInicial = typeof precio === 'string' && precio.trim() === '' ? NaN : Number(precio);
    const ubicacionLimpia = typeof ubicacion === 'string' ? ubicacion.trim() : '';

    if (!codigoLimpio || !nombreLimpio || !categoriaLimpia ||
        (typeof stock !== 'string' && typeof stock !== 'number') ||
        !Number.isInteger(stockInicial) || stockInicial < 0 ||
        (typeof precio !== 'string' && typeof precio !== 'number') ||
        !Number.isFinite(precioInicial) || precioInicial < 0) {
        return res.status(400).json({ error: 'Completa los campos requeridos con valores válidos.' });
    }

    const query = `
        INSERT INTO productos (codigo, nombre, categoria, stock, precio, ubicacion)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
        codigoLimpio,
        nombreLimpio,
        categoriaLimpia,
        stockInicial,
        precioInicial,
        ubicacionLimpia || null
    ], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('productos.codigo')) {
                return res.status(409).json({ error: 'Ya existe un producto con ese código.' });
            }
            console.error('Error al registrar producto:', err.message);
            return res.status(500).json({ error: 'No se pudo registrar el producto.' });
        }

        res.status(201).json({ id: this.lastID, message: 'Producto registrado correctamente.' });
    });
});

// --- API ENDPOINT 3: ACTUALIZAR STOCK DE UN PRODUCTO (ENCARGADO/ADMIN) ---
app.put('/api/productos/:id/stock', (req, res) => {
    const { id } = req.params;
    const { cantidad, usuario_id, tipo, observaciones } = req.body;

    // Actualizar el stock en la tabla productos
    const updateQuery = `UPDATE productos SET stock = stock + ? WHERE id = ?`;
    db.run(updateQuery, [cantidad, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        // Registrar el movimiento en el historial
        const histQuery = `
            INSERT INTO movimientos (producto_id, usuario_id, tipo, cantidad, observaciones)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.run(histQuery, [id, usuario_id, tipo, cantidad, observaciones], (err) => {
            if (err) console.error("Error guardando movimiento:", err);
        });

        res.json({ message: "Stock actualizado correctamente" });
    });
});

initializeDatabase((err) => {
    if (err) {
        console.error('Error al inicializar la base de datos:', err.message);
        db.close(() => process.exit(1));
        return;
    }

    console.log('✅ Base de datos SQLite lista');
    app.listen(PORT, () => {
        console.log(`🚀 Aplicación disponible en http://localhost:${PORT}`);
    });
});