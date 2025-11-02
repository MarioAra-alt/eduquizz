const express = require('express'); 
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json()); // Permite recibir JSON en peticiones POST
app.use(express.static(path.join(__dirname, '..'))); // Archivos estáticos (index.html, css, etc.)

// --- Conexión a MongoDB Atlas ---
// REEMPLAZA con tu cadena de conexión de MongoDB Atlas
const dbURI = 'mongodb+srv://landaverdemario959_db_user:<db_password>@auragames.y2gmy0a.mongodb.net/?appName=AuraGames'

mongoose.connect(dbURI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// --- Modelo de la base de datos para las puntuaciones ---
const scoreSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    score: { type: Number, required: true },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', scoreSchema);

// --- Rutas para preguntas HTML ---
app.get('/preguntas/ciencias', (req, res) => {
    res.sendFile(path.join(__dirname, 'questions', 'preguntasCiencias.html'));
});
app.get('/preguntas/sociales', (req, res) => {
    res.sendFile(path.join(__dirname, 'questions', 'preguntasSociales.html'));
});
app.get('/preguntas/lenguaje', (req, res) => {
    res.sendFile(path.join(__dirname, 'questions', 'preguntasLenguaje.html'));
});
app.get('/preguntas/matematicas', (req, res) => {
    res.sendFile(path.join(__dirname, 'questions', 'preguntasMatematicas.html'));
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// --- Endpoints para puntuaciones ---

// POST para guardar una nueva puntuación
app.post('/api/scores', async (req, res) => {
    try {
        const { playerName, score, category } = req.body;
        if (!playerName || score === undefined || !category) {
            return res.status(400).json({ message: 'Faltan datos (playerName, score, category)' });
        }

        const newScore = new Score({ playerName, score, category });
        await newScore.save();
        res.status(201).json({ message: 'Puntuación guardada exitosamente' });

    } catch (error) {
        res.status(500).json({ message: 'Error al guardar la puntuación', error: error.message });
    }
});

// GET para obtener el leaderboard de una categoría
app.get('/api/scores/leaderboard/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const topScores = await Score.find({ category })
            .sort({ score: -1 })
            .limit(10);
        res.json(topScores);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el leaderboard', error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log("Servidor corriendo en http://localhost:${PORT}");
});