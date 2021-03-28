const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce =  (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => res.status(201).json({message: 'sauce enregistré'}))
    .catch(error => res.status(400).json({error}))
};

exports.modifySauce =  (req, res, next) => {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : {...req.body};
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
    .then(() => res.status(200).json({message: 'Sauce modifiée'}))
    .catch(error => res.status().json({error}))
};

exports.deleteSauce =  (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id: req.params.id})
            .then(() => res.status(200).json({message: 'Sauce supprimée'}))
            .catch(error => res.status(400).json({error}))
        });
    })
    .catch(error=> res.status(500).json({error}))
   
};

exports.getOneSauce =  (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}))
};

exports.getAllSauces =  (req, res, next) => {
    Sauce.find()
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
                   $push: { usersLiked: req.body.userId},
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

