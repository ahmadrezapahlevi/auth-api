const jwt = require('jsonwebtoken');
const { signupSchema, signinSchema } = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const transport = require('../middlewares/sendMail');

exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, password });

        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(401).json({ success: false, message: 'Pengguna sudah ada' })
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = new User({
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

        const existingUser = await User.findOne({ email }).select('+password');
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
        process.env.TOKEN_SECRET,
        {
          expiresIn: '8h',
        }
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

exports.signout = async (req, res) => {
  res
  .clearCookie('Authorization')
  .status(200)
  .json({
    success: true,
    message: 'berhasil keluar dari akun'
  })
}

exports.sendVerificationCode = async (req, res) => {
  const {email} = req.body;
  try {
    const existingUser = await User.findOne({email})
            if(!existingUser){
            return res.status(404).json({ success: false, message: 'Pengguna tidak ada' })
        }
        if(existingUser.verified){
          return res.status(400).json({ success: false, message: 'Kamu sudah ter verifikasi' })
        }
        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
          from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
          to: existingUser.email,
          subject: 'verification code',
          html:'<h1>' + codeValue + '</h1>',
        })
        
        if(info.accepted[0] === existingUser.email) {
          const hashedCodeValue = hmacProcess(codeValue, process.env.MAC_VERIFICATION_CODE_SECRET)
          existingUser.verificationCode = hashedCodeValue;
          existingUser.verificationCodeValidation = Date.now();
          await existingUser.save()
          return res.status(200).json({
            success: true,
            message: 'code sent',
          })
        }
        return res.status(400).json({
            success: false,
            message: 'code sent failed',
          })
  } catch (error) {
    console.log(error);
  }
}
