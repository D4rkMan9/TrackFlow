-- ============================================================
-- TrackFlow — Dump completo para MariaDB
-- Host: br1.aguilucho.ar:25582 | DB: trackflow
-- Ejecutar con:
--   mysql -h br1.aguilucho.ar -P 25582 -u trackflow_sys -p trackflow < trackflow_seed.sql
-- ============================================================

-- ============================================================
-- 1. SCHEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS destinatarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  localidad VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(10),
  telefono VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS envios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  destinatario_id INT NOT NULL,
  numero_tracking VARCHAR(20) NOT NULL UNIQUE,
  peso DECIMAL(6,2) NOT NULL,
  descripcion TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_estimada DATE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (destinatario_id) REFERENCES destinatarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS estado_envio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  envio_id INT NOT NULL,
  estado ENUM('PENDIENTE','PROCESANDO','EN_TRANSITO','EN_DISTRIBUCION','ENTREGADO','CANCELADO') NOT NULL,
  descripcion TEXT,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (envio_id) REFERENCES envios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. DATOS DE PRUEBA
-- ============================================================

-- Contraseña de todos los usuarios de prueba: "password123"
-- Hash bcrypt generado con flask-bcrypt
INSERT INTO usuarios (id, nombre, apellido, email, telefono, password_hash, fecha_registro) VALUES
(1, 'Juan', 'Pérez', 'juan@example.com', '+54 11 1234-5678', '$2b$12$hKgrqt3iQr3zdeRJhFCi3.nKk51twZPkFek/7JO7Cc/BTXBJC9dzO', '2026-04-15 09:00:00'),
(2, 'Admin', 'TrackFlow', 'admin@trackflow.com', '+54 11 0000-0000', '$2b$12$hKgrqt3iQr3zdeRJhFCi3.nKk51twZPkFek/7JO7Cc/BTXBJC9dzO', '2026-04-01 10:00:00'),
(3, 'María', 'González', 'maria@example.com', '+54 11 5555-1234', '$2b$12$hKgrqt3iQr3zdeRJhFCi3.nKk51twZPkFek/7JO7Cc/BTXBJC9dzO', '2026-04-20 11:00:00');

INSERT INTO destinatarios (id, nombre, apellido, direccion, localidad, codigo_postal, telefono) VALUES
(1, 'María', 'González', 'Av. Corrientes 1234, Piso 5', 'Buenos Aires', 'C1043AAZ', '+54 11 9876-5432'),
(2, 'Carlos', 'Rodríguez', 'Calle San Martín 456', 'Rosario', 'S2000', '+54 341 456-7890'),
(3, 'Ana', 'Martínez', 'Pasaje Los Robles 789', 'Mendoza', 'M5500', '+54 261 234-5678'),
(4, 'Pedro', 'López', 'Av. Libertador 2500', 'San Miguel de Tucumán', 'T4000', '+54 381 987-6543'),
(5, 'Laura', 'Fernández', 'Calle Belgrano 123', 'Salta', 'A4400', '+54 387 111-2222'),
(6, 'Roberto', 'Sánchez', 'Av. Rivadavia 8900', 'Buenos Aires', 'C1408', '+54 11 4444-3333');

INSERT INTO envios (id, usuario_id, destinatario_id, numero_tracking, peso, descripcion, fecha_creacion, fecha_estimada) VALUES
(1, 1, 1, 'ENV2512345678', 2.50, 'Notebook Dell XPS 15',               '2026-04-20 10:00:00', '2026-05-01'),
(2, 1, 2, 'ENV2587654321', 0.50, 'iPhone 15 Pro Max',                  '2026-04-15 09:00:00', '2026-04-28'),
(3, 1, 3, 'ENV2511112222', 0.30, 'Auriculares Sony WH-1000XM5',        '2026-04-26 11:00:00', '2026-05-05'),
(4, 1, 4, 'ENV2533334444', 1.00, 'Zapatillas Nike Air Max',             '2026-04-18 08:00:00', '2026-04-30'),
(5, 1, 5, 'ENV2555556666', 1.80, 'Cámara Canon EOS R5',                 '2026-04-10 12:00:00', '2026-04-22'),
(6, 2, 6, 'ENV2577778888', 3.20, 'Monitor Samsung Odyssey G7',          '2026-04-22 14:30:00', '2026-05-03'),
(7, 3, 3, 'ENV2599990000', 0.80, 'Tablet iPad Air M2',                  '2026-04-28 09:15:00', '2026-05-08');

-- ============================================================
-- 3. HISTORIAL DE ESTADOS
-- ============================================================

-- Envío 1: EN_TRANSITO
INSERT INTO estado_envio (envio_id, estado, descripcion, fecha_hora) VALUES
(1, 'PENDIENTE',    'Envío registrado en el sistema',     '2026-04-20 10:00:00'),
(1, 'PROCESANDO',   'Paquete recibido y en preparación',  '2026-04-21 14:30:00'),
(1, 'EN_TRANSITO',  'En camino hacia destino',            '2026-04-22 08:15:00');

-- Envío 2: ENTREGADO
INSERT INTO estado_envio (envio_id, estado, descripcion, fecha_hora) VALUES
(2, 'PENDIENTE',      'Envío registrado en el sistema',     '2026-04-15 09:00:00'),
(2, 'PROCESANDO',     'Paquete recibido y en preparación',  '2026-04-15 16:00:00'),
(2, 'EN_TRANSITO',    'En camino hacia destino',            '2026-04-16 07:00:00'),
(2, 'EN_DISTRIBUCION','En reparto local',                   '2026-04-17 10:30:00'),
(2, 'ENTREGADO',      'Entregado al destinatario',          '2026-04-17 14:45:00');

-- Envío 3: PENDIENTE
INSERT INTO estado_envio (envio_id, estado, descripcion, fecha_hora) VALUES
(3, 'PENDIENTE', 'Envío registrado en el sistema', '2026-04-26 11:00:00');

-- Envío 4: EN_DISTRIBUCION
INSERT INTO estado_envio (envio_id, estado, descripcion, fecha_hora) VALUES
(4, 'PENDIENTE',      'Envío registrado en el sistema',     '2026-04-18 08:00:00'),
(4, 'PROCESANDO',     'Paquete recibido y en preparación',  '2026-04-18 15:00:00'),
(4, 'EN_TRANSITO',    'En camino hacia destino',            '2026-04-19 06:30:00'),
(4, 'EN_DISTRIBUCION','En reparto local',                   '2026-04-25 09:00:00');

-- Envío 5: CANCELADO
INSERT INTO estado_envio (envio_id, estado, descripcion, fecha_hora) VALUES
(5, 'PENDIENTE',  'Envío registrado en el sistema',       '2026-04-10 12:00:00'),
(5, 'CANCELADO',  'Envío cancelado por el remitente',     '2026-04-11 09:30:00');

-- Envío 6: EN_TRANSITO
INSERT INTO estado_envio (envio_id, estado, descripcion, fecha_hora) VALUES
(6, 'PENDIENTE',   'Envío registrado en el sistema',     '2026-04-22 14:30:00'),
(6, 'PROCESANDO',  'Paquete recibido y en preparación',  '2026-04-23 09:00:00'),
(6, 'EN_TRANSITO', 'En camino hacia destino',            '2026-04-24 06:45:00');

-- Envío 7: PENDIENTE
INSERT INTO estado_envio (envio_id, estado, descripcion, fecha_hora) VALUES
(7, 'PENDIENTE', 'Envío registrado en el sistema', '2026-04-28 09:15:00');
