const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

const app = express();

// Middleware global
app.use(cors());
app.use(bodyParser.json());

// Configuración de Multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se almacenarán los archivos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Crear carpeta 'uploads' 
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Ruta para manejar la carga de imágenes
app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({
    message: 'Image uploaded successfully',
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
  });
});

// Servir imágenes desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Otras rutas
app.use(routes);

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
