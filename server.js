const express = require('express');
const figlet = require('figlet');
const app = express();
const port = 3000;

app.use(express.static('public'));

// Endpoint para obtener todas las fuentes
app.get('/fonts', (req, res) => {
    figlet.fonts((err, fonts) => {
        res.json(fonts); 
    });
});

// Endpoint para convertir texto
app.get('/convert', (req, res) => {
    const text = req.query.text 
    const font = req.query.font 

    figlet.text(text, { font: font }, (err, result) => {
        res.send(result);
    });
});

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
