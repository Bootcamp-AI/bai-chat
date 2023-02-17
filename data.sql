CREATE DATABASE IF NOT EXISTS whaticket;

USE whaticket;

CREATE TABLE usuario( \
  usuario_id  INT(11) AUTO_INCREMENT PRIMARY KEY,  \
  fecha  VARCHAR(20),\
  celular BIGINT(20),    \
  pregunta VARCHAR(200),    \
  boton VARCHAR(100), \
  estado VARCHAR(100)
  );

INSERT INTO Usuario(fecha, celular, pregunta, boton, estado) VALUES("10/12/2022 20:00:00", "593984695956", "Pregunta 1", "Boton 1", "Activo");
