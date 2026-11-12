-- TABLA DE ROLES
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE -- 'admin', 'encargado'
);

-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- TABLA DE INVENTARIO / PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100),
    stock INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 5,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ubicacion VARCHAR(100), -- Ej. "Almacén A - Pasillo 3"
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE HISTORIAL DE MOVIMIENTOS
CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'entrada', 'salida', 'ajuste'
    cantidad INTEGER NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- INSERTAR ROLES Y USUARIOS INICIALES DE PRUEBA
INSERT OR IGNORE INTO roles (id, nombre) VALUES (1, 'admin'), (2, 'encargado');

-- Admin: admin@ejemplo.com (clave: admin123)
INSERT OR IGNORE INTO usuarios (id, nombre, email, password_hash, rol_id) 
VALUES (1, 'Administrador General', 'admin@ejemplo.com', 'admin123', 1);

-- Encargado: encargado@ejemplo.com (clave: encargado123)
INSERT OR IGNORE INTO usuarios (id, nombre, email, password_hash, rol_id) 
VALUES (2, 'Encargado de Turno', 'encargado@ejemplo.com', 'encargado123', 2);