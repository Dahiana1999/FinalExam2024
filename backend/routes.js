const express = require('express');
const { uploadFile, recognizeSpeech, generateImage, askQuestion } = require('./controllers');
const multer = require('multer');

const router = express.Router();
const upload = multer(); // Middleware para manejar archivos

// Rutas
router.post('/upload-image', upload.single('file'), uploadFile);
router.post('/recognize', upload.single('audio'), recognizeSpeech);
router.post('/generate-image', generateImage);
router.post('/ask', askQuestion);

module.exports = router;
