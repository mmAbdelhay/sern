const BookRepository = require("../../repositories/BookRepository");

module.exports.BookExistenceMiddleware = async (req, res, next) => {
    if (!req.params.Book) return res.status(404).json({message: "Not found"});

    const item = await BookRepository.findBy({id: req.params.Book});
    if (!item) return res.status(404).json({message: "Not found"});

    req.params.Book = item

    next();
};