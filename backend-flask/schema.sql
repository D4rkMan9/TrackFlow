-- TrackFlow — Schema MySQL
-- Ejecutar con: mysql -u root -p trackflow < schema.sql

CREATE DATABASE IF NOT EXISTS trackflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE trackflow;

-- Usuarios (remitentes registrados en el sistema)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Destinatarios (a quién se envía el paquete)
CREATE TABLE IF NOT EXISTS destinatarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  localidad VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(10),
  telefono VARCHAR(20)
);

-- Envíos
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
);

-- Historial de estados del envío
CREATE TABLE IF NOT EXISTS estado_envio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  envio_id INT NOT NULL,
  estado ENUM('PENDIENTE','PROCESANDO','EN_TRANSITO','EN_DISTRIBUCION','ENTREGADO','CANCELADO') NOT NULL,
  descripcion TEXT,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (envio_id) REFERENCES envios(id)
);
