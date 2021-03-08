const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const emailValidator = require('email-validator');
const dotenv = require('dotenv').config();
const passwordValidator = require('password-validator');
 
const sauceRoutes = require('./routes/Sauce')
const userRoutes = require('./routes/user')
const app = express();

mongoose.connect(
  process.env.DB_HOST,
    {useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


let schema = new passwordValidator();
schema
.is().min(8)
.has().uppercase()
.has().lowercase()
.has().digits(2)
.has().not().spaces() 

emailValidator.validate('test@email.com')
 
app.use(bodyParser.json());
app.use(helmet());

app.set('trust proxy', 1);
app.use(session({
  secret: 's3Cur3',
  name: 'sessionID',
  resave: false,
  saveUninitialized: true
})); 
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);



module.exports = app;