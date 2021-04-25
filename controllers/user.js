
const bcrypt = require('bcrypt');//package de cryptage de mot de passe
const User = require('../models/user');
const jwt = require('jsonwebtoken');//créer et vérifier les tokens
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const sha256 = require('sha256');
 
exports.signup = (req, res, next) => {
    
    let checkEmail = emailValidator.validate(req.body.email); //validation de l'email
    let checkPass = new passwordValidator(); 
    checkPass
    .is().min(8)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces()
    let validPass = checkPass.validate(req.body.password);//validation de mot de passe

     
    const maskedEmail = sha256(req.body.email);
    
   if(checkEmail && validPass) {
        bcrypt.hash(req.body.password, 10) //on hash le mot de passe et on exécute le hashage 10 fois
        .then(hash => {
            const user = new User({ // création du nouvel utilisateur
                email: maskedEmail,
                password: hash
            });
            user.save() //enregistrement de l'user dans la base de donnée
            .then(() => res.status(201).json({message: 'utilisateur crée'}))
            .catch(error => res.status(400).json({error}))
        })
        .catch(error => res.status(500).json({error}))
    }else {
        res.status(500).json('email ou mot de passe invalide');
    }
   
};

exports.login = (req, res, next) => {
    let checkEmail = emailValidator.validate(req.body.email);
    let checkPass = new passwordValidator();
    checkPass
    .is().min(8)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces()
    let validPass = checkPass.validate(req.body.password);

    const maskedEmail = sha256(req.body.email);
    
    if(checkEmail && validPass) {
        User.findOne({email: maskedEmail})// trouver l'user de la base de donnée s'il existe
        .then(user => {
            if(!user) {
                return res.status(401).json({message: 'Utilisatuer non trouvé'});
            }
            bcrypt.compare(req.body.password, user.password)// on compare le mot de passe avec le hash du user enregistré
            .then(valid => {
                if(!valid) {
                    return res.status(401).json({message: 'Mot de passe incorrect'});   
                }
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        {userId: user._id},//user encodé
                        process.env.SECRET_KEY_TOKEN,// clé secréte pour encodage
                        {expiresIn: '24h'} // expiration du token
                    )
                });
            })
            .catch(error => res.status(500). json({error}))
        })
        .catch(error => res.status(500).json({error}))
    }else{
        res.status(500).json('utilisateur non trouvé');
    }
};