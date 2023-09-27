const Validator = require("validatorjs");

module.exports.BookValidationMiddleware = async (req, res, next) => {
    const rules = require(`../../controllers/Book/${req.method === 'POST' ? 'create' : 'update'}BookRules`)
    const validation = new Validator(req.body, rules);
    if (validation.fails()) return res.status(402).json(validation.errors.all());

    req.body.validated = validation.input;
    next();
};