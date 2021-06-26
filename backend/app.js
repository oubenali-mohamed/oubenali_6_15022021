const express = require('express'); //importer express
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); //package qui facilite l'interaction avec la base de donnée
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const dotenv = require('dotenv').config();
const sauceRoutes = require('./routes/Sauce');
const userRoutes = require('./routes/user');
const app = express(); //application express créée avec la méthode express

//connection base de donnée
mongoose.connect( `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}${process.env.DB_HOST}`,
   {useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  app.use((req, res, next) => {/*
    d'accéder à notre API depuis n'importe quelle origine
    d'ajouter les headers mentionnés aux requêtes envoyées vers notre API 
    d'envoyer des requêtes avec les méthodes mentionnées*/
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(bodyParser.json());//transforme le corps de la requet en json pour la rendre exploitable
app.use(helmet()); //Pour sécuriser les en-têtes HTTP, minimum désactiver l'en-tête X-Powered-By
app.disable('x-powered-by');//on désactive au minimum x-powered-by
app.set('trust proxy', 1);
app.use(session({ //génére un id de session
  secret: process.env.SECRET,
  name: 'sessionID',
  resave: false,
  saveUninitialized: true,
 })); 

app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));//donne accés au chemin de notre systeme de fichier
app.use('/api/sauces', sauceRoutes);


module.exports = app;//exporter l'application pour y avoir accés dans les autres fichier.