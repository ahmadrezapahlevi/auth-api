const Joi = require('joi');

exports.signupSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .email({ tlds: { allow: ['com', 'net'] } })
        .required(),

    password: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});

exports.signinSchema = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .email({ tlds: { allow: ['com', 'net'] } })
        .required(),

    password: Joi.string()
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});
