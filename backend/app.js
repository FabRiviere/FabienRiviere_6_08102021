const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();
const session = require('express-session');

// on importe les routeurs
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

mongoose.connect(process.env.MONGODB_PATH,
{   useNewUrlParser: true,
    useUnifiedTopology: true    })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.AUTHORIZED_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

// app.use(
//   cors({
//     origin: "http://localhost:8081"
//   })
// )

app.use(bodyParser.json());

// Utilisation de 'morgan' pour logger les requêtes passées au serveur
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Sécurisation des headers
app.use(helmet());

// Stockage du json web token coté frontend dans la session
app.use(session({ secret: process.env.COOKIE_MDP, resave: true, 
                  saveUninitialized: true, cookie: { maxAge: 1800000}})) //cookie stocké pdt 30min

app.use('/images', express.static(path.join(__dirname, 'images')));

// On enregistre notre routeur
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
  

module.exports = app;