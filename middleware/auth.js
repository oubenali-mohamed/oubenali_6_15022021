const jwt = require('jsonwebtoken'); //package pour vérifier nos token

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];//récupérer le token dans le deuxiéme élement du tableau
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');//on décode le token pour le vérifié
        const userId = decodedToken.userId;//récupére l'user dans l'objet decodedToken
        if(req.body.userId && req.body.userId !== userId){// si userID de la requete correspond a celui du token
            throw 'User ID non valable';//si different on retourne une erreur
        } else {
            next();
        }
    } catch (error) {
       res.status(401).json({error: error | 'requete non authentifié'}); 
    }
}