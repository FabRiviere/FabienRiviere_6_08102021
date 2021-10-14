const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

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

// Sécurisation des headers
app.use(helmet());

app.use('/images', express.static(path.join(__dirname, 'images')));

// On enregistre notre routeur
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
  

module.exports = app;