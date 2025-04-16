const { required } = require('joi');
const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "wajib memasukan judul"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'wajib memasukan deskripsi'],
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
},{timestamps:true})

module.exports = mongoose.model('Post', postSchema);