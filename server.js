const express = require('express');
const figlet = require('figlet');
const app = express();
const port = 3000;
const crypto = require('crypto');
const { getUser } = require('./database');


app.use(express.static('public'));

const realm = 'User Visible Realm';

// Middleware para autenticar usando Auth Basic HTTP
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // Si no hay cabecera de autorización o no es del tipo Basic, pedir credenciales
    res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
    return res.status(401).send('Autenticación requerida');
  }

  // Decodificar credenciales base64
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const user = getUser(username);authMiddleware
  const md5hash = crypto.createHash('md5').update(password).digest('hex');

  if (!user || user.password !== md5hash) {
    // Si el usuario no existe o la contraseña es incorrecta
    res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
    return res.status(401).send('Credenciales incorrectas');
  }authMiddleware

  // Si las credenciales son correctas, continuar con la siguiente función
  return next();
}

app.get('/', authMiddleware, (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });

app.get('/protected', authMiddleware,(req, res) => {
    const authHeader = req.headers['authorization'];
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username] = credentials.split(':');
    
    res.send(`Bienvenido ${username}, ya puedes probar nuestro figlet.`);
});
  
  // Endpoint para obtener todas las fuentes
  app.get('/fonts', (req, res) => {
      figlet.fonts((err, fonts) => {
        res.json(fonts); 
    });
});

// Endpoint para convertir texto
app.get('/convert', authMiddleware, (req, res) => {
    const text = req.query.text 
    const font = req.query.font 

    figlet.text(text, { font: font }, (err, result) => {
        res.send(result);
    });
});
app.get('/logout', (req, res) => {
    res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
    res.status(401).send('Has sido deslogueado');
  });

app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});