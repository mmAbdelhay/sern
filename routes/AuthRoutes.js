const userController = require("../controllers/Auth/AuthController");

module.exports = function (app) {
  app.post("/auth/login", userController.login);
  app.post("/auth/register", userController.register);
  app.get("/auth/user", userController.user);
};

