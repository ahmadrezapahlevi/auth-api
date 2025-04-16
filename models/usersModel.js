const { required } = require('joi');
const { verify } = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "wajib memasukan email"],
        trim: true,
        unique: [true, "email harus unik"],
        minLength: [5, "email harus memiliki 5 karakter"],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "password must be provided"],
        trim: true,
        select: false,
    },
    verified:{
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        default: false,
    },
    verificationCodeValidation: {
        type: Number,
        default: false,
    },
    forgotPasswordCode:{
        type: String,
        default: false,
    },
    forgotPasswordCodeValidation:{
        type: Number,
        default: false,
    }
},{
    timestamps:true
});

module.exports = mongoose.model("User", userSchema);