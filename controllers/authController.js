const jwt = require('jsonwebtoken');
const { signupSchema, signinSchema} = require("../middlewares/validator");
const usersModel = require("../models/usersModel");
const { doHash, doHashValidation } = require("../utils/hashing");

exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, password });

        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await usersModel.findOne({ email });

        if (existingUser) {
            return res.status(401).json({ success: false, message: 'Pengguna sudah ada' })
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = new usersModel({
            email,
            password: hashedPassword,
        })
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({
            success: true,
            message: 'Akun anda berhasil dibuat',
            result,
        })
    } catch (error) {
        console.log(error)
    }
}

exports.signin = async (req, res) => {
    const {email, password} = req.body;
    try{
        const { error, value } = signinSchema.validate({ email, password });

        if(error){
            return res.status(401).json({ success: false, message: error.details[0].message })
        }

        const existingUser = await usersModel.findOne({ email }).select('+password');
        if(!existingUser){
            return res.status(401).json({ success: false, message: 'Pengguna tidak ada' })
        }
        const result = await doHashValidation(password, existingUser.password)
        if(!result){
          return res.status(401).json({ success: false, message: 'invalid credentials' })
        }
        const token = jwt.sign({
          userId: existingUser._id,
          email: existingUser.email,
          verified: existingUser.verified,
        }, 
        process.env.TOKEN_SECRET
        );
        
        res.cookie('Authorization', 'Bearer ' + token, { expires: new Date(Date.now() + 8 * 3600000), httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production'}).json({
          success:true,
          token,
          message:'login berhasil',
        })
        
    } catch (error) {
        console.log(error);

    }
}