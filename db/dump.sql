-- SQL dump for hotel management system database

-- Create the hotels table
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    nit VARCHAR(20) NOT NULL UNIQUE,
    numero_habitaciones INT NOT NULL CHECK (numero_habitaciones > 0)
);

-- Create the room_types table
CREATE TABLE room_types (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE
);

-- Create the accommodations table
CREATE TABLE accommodations (
    id SERIAL PRIMARY KEY,
    tipo_habitacion_id INT NOT NULL,
    acomodacion VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    FOREIGN KEY (tipo_habitacion_id) REFERENCES room_types(id)
);

-- Insert room types
INSERT INTO room_types (tipo) VALUES
('ESTANDAR'),
('JUNIOR'),
('SUITE');

-- Insert sample hotels
INSERT INTO hotels (nombre, direccion, ciudad, nit, numero_habitaciones) VALUES
('DECAMERON CARTAGENA', 'CALLE 23 58-25', 'CARTAGENA', '12345678-9', 42);

-- Insert sample accommodations
INSERT INTO accommodations (tipo_habitacion_id, acomodacion, cantidad) VALUES
(1, 'SENCILLA', 25),
(2, 'TRIPLE', 12),
(1, 'DOBLE', 5);