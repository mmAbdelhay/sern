const router = require("express").Router();
const jwt = require("jsonwebtoken");
const userRepository = require("../../repositories/UserRepository");
const hashComparer = require("../../services/hash");
const token = require("../../services/token");
const Validator = require('validatorjs');
const validationRules = require("./Rules");

module.exports.login = async (req, res) => {
    const user = await userRepository.findByEmail(req.body);
    if (!user) return res.status(403).json({message: "Auth credentials error"});

    if (!await hashComparer.hashCompare(req.body.password, user.password))
        return res.status(403).json({message: "Auth credentials error"});

    return res.status(200).json({
        message: "user logged in successfully",
        token: token.generateToken(user.id, "User"),
    });
};

module.exports.register = async (req, res) => {
    const validation = new Validator(req.body, validationRules);
    if (validation.fails()) return res.status(402).json(validation.errors.all());

    const user = await userRepository.findByEmail(req.body);
    if (user) return res.status(403).json({message: "Email registered before"});

    const newUser = await userRepository.insertUser(req.body);
    return res.status(201).json({message: "Registered Successfully", user: newUser});
};

module.exports.user = async (req, res) => {
    const userFound = await userRepository.findByID(req.authUser);
    if (!userFound) return res.status(404).json({message: "User not found."});
    return res.status(200).json({user: userFound});
};
