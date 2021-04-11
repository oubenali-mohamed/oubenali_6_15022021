const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
});

userSchema.plugin(uniqueValidator);//plugin pour ne pas pouvoir s'incrire à plusieurs fois avec le meme email
module.exports = mongoose.model('user', userSchema);