const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const db = mysql.createConnection({
  host: 'database-1.ctkaie244dl7.us-east-1.rds.amazonaws.com',
  user: 'root',
  password: 'abc123abc',
  database: 'harry_potter_db',
  ssl: {
    ca: fs.readFileSync(__dirname + '/global-bundle.pem')
  }
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar con AWS RDS:', err.message);
    return;
  }
  console.log('Conectado a la base de datos en AWS exitosamente');
});

app.get('/api/estudiantes', (req, res) => {
  const query = `
    SELECT 
      Estudiante.idEstudiante, 
      Estudiante.nombre, 
      Estudiante.apellido, 
      Estudiante.edad, 
      Estudiante.año_cursado, 
      Casa.nombre AS casa 
    FROM Estudiante 
    LEFT JOIN Casa ON Estudiante.idCasa = Casa.idCasa;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en SELECT:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/api/estudiantes', (req, res) => {
  const { nombre, apellido, edad, año_cursado, idCasa } = req.body;
  const query = 'INSERT INTO Estudiante (nombre, apellido, edad, año_cursado, idCasa) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [nombre, apellido, parseInt(edad), parseInt(año_cursado), parseInt(idCasa)], (err, result) => {
    if (err) {
      console.error('Error en INSERT:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Estudiante creado exitosamente', id: result.insertId });
  });
});

app.put('/api/estudiantes/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, edad, año_cursado, idCasa } = req.body;
  const query = 'UPDATE Estudiante SET nombre = ?, apellido = ?, edad = ?, año_cursado = ?, idCasa = ? WHERE idEstudiante = ?';
  
  db.query(query, [nombre, apellido, parseInt(edad), parseInt(año_cursado), parseInt(idCasa), id], (err, result) => {
    if (err) {
      console.error('Error en UPDATE:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Estudiante actualizado exitosamente' });
  });
});

app.delete('/api/estudiantes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Estudiante WHERE idEstudiante = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error en DELETE:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Estudiante eliminado exitosamente' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
