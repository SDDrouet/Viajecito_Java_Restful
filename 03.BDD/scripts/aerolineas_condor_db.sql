-- Tabla de Ciudades
CREATE TABLE IF NOT EXISTS ciudades (
    id_ciudad INT AUTO_INCREMENT PRIMARY KEY,
    codigo_ciudad VARCHAR(3) NOT NULL UNIQUE,
    nombre_ciudad VARCHAR(100) NOT NULL
);

-- Tabla de Vuelos
CREATE TABLE IF NOT EXISTS vuelos (
    id_vuelo INT AUTO_INCREMENT PRIMARY KEY,
    codigo_vuelo VARCHAR(10) NOT NULL UNIQUE,
    id_ciudad_origen INT NOT NULL,
    id_ciudad_destino INT NOT NULL,
    valor NUMERIC(7,2) NOT NULL,
    hora_salida DATETIME NOT NULL,
    capacidad INT NOT NULL,
    disponibles INT NOT NULL,
    FOREIGN KEY (id_ciudad_origen) REFERENCES ciudades(id_ciudad),
    FOREIGN KEY (id_ciudad_destino) REFERENCES ciudades(id_ciudad)
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    username VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    telefono VARCHAR(15)
);

-- Tabla de Boletos
CREATE TABLE IF NOT EXISTS boletos (
    id_boleto INT AUTO_INCREMENT PRIMARY KEY,
    numero_boleto VARCHAR(20) NOT NULL UNIQUE,
    id_vuelo INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    precio_compra NUMERIC(7,2) NOT NULL,
    FOREIGN KEY (id_vuelo) REFERENCES vuelos(id_vuelo),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Inserción de datos en la tabla de ciudades
INSERT INTO ciudades (codigo_ciudad, nombre_ciudad) VALUES
('UIO', 'Quito'),
('GYE', 'Guayaquil'),
('CUE', 'Cuenca'),
('MIA', 'Miami');

-- Inserción de datos en la tabla de vuelos (usando IDs de ciudades)
INSERT INTO vuelos (codigo_vuelo, id_ciudad_origen, id_ciudad_destino, valor, hora_salida, capacidad, disponibles)
VALUES
('VUE001', 1, 2, 120.50, '2025-06-15 08:30:00', 150, 150),
('VUE002', 2, 1, 125.75, '2025-06-15 10:45:00', 150, 150),
('VUE003', 1, 3, 90.25, '2025-06-16 09:15:00', 120, 120),
('VUE004', 3, 1, 95.50, '2025-06-16 11:30:00', 120, 120),
('VUE005', 2, 3, 85.00, '2025-06-17 07:45:00', 100, 100),
('VUE006', 3, 2, 80.25, '2025-06-17 13:20:00', 100, 100),
('VUE007', 1, 4, 450.75, '2025-06-18 23:45:00', 200, 200),
('VUE008', 4, 1, 475.50, '2025-06-19 05:30:00', 200, 200);


INSERT INTO usuarios (nombre, username, password, telefono)
VALUES ('MONSTER', 'MONSTER', 'MONSTER9', '0987654321');
