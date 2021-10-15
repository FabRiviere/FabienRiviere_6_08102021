const Sauce = require('../models/Sauce');
const fs = require('fs');

//  On sépare la logique métier de nos routes

// Afficher Toutes les Sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// Afficher une seule sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Créer une sauce
exports.createSauce = (req, res, next) => { 
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
        .catch(error => {
            console.log(json({ error }));
            res.status(400).json({ error });           
        });
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => { 
//         const sauceObject = req.file ?
//         {
//             ...JSON.parse(req.body.sauce),
//             imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
//          } : {...req.body };
//          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
//             .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
//             .catch(error => res.status(400).json({ error }));
// }
    if(req.file) {
        // Si l'image est modifiée, on supprime l'ancienne image du dossier /images
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    // après suppression de l'ancienne image on met à jour le dossier en ajoutant la nouvelle image
                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    }
                    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id})
                        .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
                        .catch(error => res.status(400).json({ error }));
                })
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        // Si l'image n'est pas modifiée
        const sauceObject = { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
            .catch(error => res.status(400).json({ error }));
    }
};


// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then( sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
   
};

// ! LIKE ET DISLIKE une sauce

exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    const sauceId = req.params.id;
    Sauce.findOne({ _id: sauceId })
        .then(sauce => {
            // nouvelles valeurs à modifier
            const newValues = {
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked,
                likes: 0,
                dislikes: 0
            }
            // suivant les cas
            switch (like) {
                // lorsque sauce "likée"
                case 1: 
                    newValues.usersLiked.push(userId);
                    break;
                // lorsque sauce "dislikée"
                case -1: 
                    newValues.usersDisliked.push(userId);
                    break;
                // pas d'avis ou annulation du like ou dislike
                case 0:
                    if(newValues.usersLiked.includes(userId)) {
                        //si annulation du like
                        const index = newValues.usersLiked.indexOf(userId);
                        newValues.usersLiked.splice(index, 1);
                    } else {
                        // si annulation du dislike
                        const index = newValues.usersDisliked.indexOf(userId);
                        newValues.usersDisliked.splice(index, 1);
                    }
                    break;
            };
            // Calcul du nombre de likes et dislikes
            newValues.likes = newValues.usersLiked.length;
            newValues.dislikes = newValues.usersDisliked.length;
            // Mise à jour des nouvelles valeurs de la sauce
            Sauce.updateOne({ _id: sauceId }, newValues )
                .then(() => res.status(200).json({ message: 'Note attribuée à la sauce !'}))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }));
};