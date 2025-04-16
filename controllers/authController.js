const { signupSchema } = require("../middlewares/validator");
const usersModel = require("../models/usersModel");
const { doHash } = require("../utils/hashing");

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
        const {error, value} = signinSchema({email, password});

        if(error){
            return res.status(401).json({ success: false, message: error.details[0].message })
        }

        const existingUser = await UserActivation.findOne({email}).select('+password')
        if(!existingUser){
            return res.status(401).json({ success: false, message: 'Pengguna tidak ada' })
        }
        
    } catch (error) {
        console.log(error);

    }
}