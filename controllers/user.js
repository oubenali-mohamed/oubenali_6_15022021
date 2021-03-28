
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
 
exports.signup = (req, res, next) => {
    let checkEmail = emailValidator.validate(req.body.email);
    let checkPass = new passwordValidator();
    checkPass
    .is().min(8)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().not().spaces()
    let validPass = checkPass.validate(req.body.password);
    
    if(checkEmail && validPass) {
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
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

    if(checkEmail && validPass) {
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user) {
                return res.status(401).json({message: 'Utilisatuer non trouvé'});
            }
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid) {
                    return res.status(401).json({message: 'Mot de passe incorrect'});   
                }
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        {userId: user._id},
                        'RANDOM_TOKEN_SECRET',
                        {expiresIn: '24h'}
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