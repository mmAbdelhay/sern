const db = require("../database/models/index");
const hash = require("../services/hash");
const logger = require("../services/logger");

module.exports.insertUser = async (user) => {
    try {
        const user = await db.User.create({
            name: user.name,
            email: user.email,
            password: await hash.hashPassword(user.password),
        });
        return {email: user.email, password: user.password};
    } catch (err) {
        logger.error("Database Insertion failed err: ", err);
        return false;
    }
};

module.exports.findByEmail = async (user) => {
    try {
        const retrievedUser = await db.User.findOne({
            where: {
                email: user.email,
            },
        });
        return retrievedUser ?? false;
    } catch (err) {
        logger.error("Database Selection failed err: ", err);
        return false;
    }
};

module.exports.findByID = async (user) => {
    try {
        const User_retrieved = await db.User.findOne({
            where: {
                id: user._id,
            },
            attributes: ["id", "name", "email"],
        });
        return User_retrieved ? User_retrieved : false;
    } catch (err) {
        logger.error("Database Selection failed err: ", err);
        return false;
    }
};
