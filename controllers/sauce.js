const Sauce = require('../models/Sauce');
const fs = require('fs'); // acces au fichier systeme
const app = require('../app');


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    if(sauceObject.name == null || sauceObject.name.length < 5){
        res.status(400).json('le nom de la sauce doit etre supérieur à 5')
        return;
    } 
    if(sauceObject.manufacturer == null || sauceObject.manufacturer.length < 5) {
        res.status(400).json('Manufacturer doit contenir au minimum 5 caractéres')
        return;
    }
    if(sauceObject.description == null || sauceObject.description.length < 15) {
        res.status(400).json('la description doit contenir au minimum 15 caractéres')
        return;
    }
    if(sauceObject.mainPepper == null || sauceObject.mainPepper.length < 5) {
        res.status(400).json('MainPepper doit contenir au minimum 5 caractéres')
        return;
    }
    if(Number(sauceObject.heat) == null || Number(sauceObject.heat) < 0 && Number(sauceObject.heat) > 10) {
        res.status(400).json('la note doit etre comprise entre 1 et 10')
        return;
    }
        delete sauceObject._id //supprime l'ID car il est généré automatiquement par mongoose
        const sauce = new Sauce({ //instance de notre modéle
        ...sauceObject, //recupére toutes les infos de la sauce dans la requete
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`//url de l'image
    });
    sauce.save() //appeller la méthode save qui enregistre le modélde dans la base
    .then(() => res.status(201).json({message: 'sauce enregistré'}))
    .catch(error => res.status(400).json({error}))
};

exports.modifySauce =  (req, res, next) => {
   const sauceObject = req.file ? //operateur ternaire pour voir req.file existe
   {
       ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : {...req.body}; //copie de req.body si elle n'existe pas
    if(sauceObject.name == null || sauceObject.name.length < 5){
        res.status(400).json('le nom de la sauce doit etre supérieur à 5')
        return;
    } 
    if(sauceObject.manufacturer == null || sauceObject.manufacturer.length < 5) {
        res.status(400).json('Manufacturer doit contenir au minimum 5 caractéres')
        return;
    }
    if(sauceObject.description == null || sauceObject.description.length < 15) {
        res.status(400).json('la description doit contenir au minimum 15 caractéres')
        return;
    }
    if(sauceObject.mainPepper == null || sauceObject.mainPepper.length < 5) {
        res.status(400).json('MainPepper doit contenir au minimum 5 caractéres')
        return;
    }
    if( Number(sauceObject.heat) < 0 && Number(sauceObject.heat) > 10) {
        res.status(400).json('la note doit etre comprise entre 1 et 10')
        return;
    }
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})//objet de comparaison en 1er argument nouvelle objet en 2eme argument
    .then(() => res.status(200).json({message: 'Sauce modifiée'}))
    .catch(error => res.status().json({error}))
};

exports.deleteSauce =  (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];//nom du fichier
        fs.unlink(`images/${filename}`, () => {//méthode pour supprimer le fichier
            Sauce.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: 'Sauce supprimée'}))
            .catch(error => res.status(400).json({error}))
        });
    })
    .catch(error=> res.status(500).json({error}))
   
};

exports.getOneSauce =  (req, res, next) => {
    Sauce.findOne({_id: req.params.id}) // récupére une seul sauce: ID de la sauce est le meme que l'ID de la requete
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}))
};

exports.getAllSauces =  (req, res, next) => {
    Sauce.find() //récupération de toutes les sauces
    .then(sauces => res.status(200).json(sauces))
    .catch(error=> res.status(400).json({error}));
 };

 exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // récupération de la sauce
   .then(sauce => {
       switch (req.body.like) { 
           case -1: // dislike
               Sauce.updateOne({ _id: req.params.id }, {
                   $inc: {dislikes:1}, // L'utilsateur a disliké
                   $push: {usersDisliked: req.body.userId}, // id enregistré dans le tableau de dislike
                   _id: req.params.id
               })
                   .then(() => res.status(200).json({ message: 'Dislike ajouté !'}))
                   .catch( error => res.status(400).json({ error }))
               break;
           case 0: // like retiré
               if (sauce.usersLiked.find(user => user === req.body.userId)) {
                   Sauce.updateOne({ _id : req.params.id }, {
                       $inc: {likes:-1}, // Like retiré
                       $pull: {usersLiked: req.body.userId}, // id enregistré dans le tableau de like
                       _id: req.params.id
                   })
                       .then(() => res.status(200).json({message: ' Like retiré !'}))
                       .catch( error => res.status(400).json({ error }))
               }
               if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                   Sauce.updateOne({ _id : req.params.id }, {
                       $inc: {dislikes:-1}, // dislike retiré
                       $pull: {usersDisliked: req.body.userId}, // id enregistré dans le tableau de dislike
                       _id: req.params.id
                   })
                       .then(() => res.status(200).json({message: ' Dislike retiré !'}))
                       .catch( error => res.status(400).json({ error }));
               }
               break;
           case 1: // like
               Sauce.updateOne({ _id: req.params.id }, {
                   $inc: { likes:1}, //like ajouté
                   $push: { usersLiked: req.body.userId}, // id enregistré dans le tableau de like
                   _id: req.params.id
               })
                   .then(() => res.status(200).json({ message: 'Like ajouté !'}))
                   .catch( error => res.status(400).json({ error }));
               break;
           default:
               return res.status(400).json({ error });
       }
   })
   .catch(error => res.status(500).json({ error }))
  };

