const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    //self described username
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

const User = mongoose.model('User', UserSchema)

module.exports = User