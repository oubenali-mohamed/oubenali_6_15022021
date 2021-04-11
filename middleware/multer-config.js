const multer = require('multer');

const MIME_TYPES = {//dictionnaire pour les extensions
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png'
};
const storage = multer.diskStorage({//objet de configuration multer
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {//nom de fichier utilisé
        const name = file.originalname.split(' ').join('_');//on génére le nouveau nom en éliminant les espaces
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});
let maxSize = 1 * 1000 * 1000;
module.exports = multer({storage:storage, limits:{filesize: maxSize}}).single('image');//on exporte l'objet storage qui est un fichier image unique