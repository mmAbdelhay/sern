require("dotenv").config();

const AdminBro = require("admin-bro");
const AdminBroExpress = require("@admin-bro/express");
const AdminBroSequelize = require("@admin-bro/sequelize");
const db = require("../database/models");
const hash = require("../services/hash");

const User = {
  resource: db.User,
  options: {
    actions: {
      new: {
        before: async (request) => {
          const { email, password } = request.payload;
          const hashedPassword = await hash.hashPassword(password)
          request.payload = { ...request.payload, password: hashedPassword };
          return request;
        },
      },
    },
  },
};

module.exports = function (app) {
  AdminBro.registerAdapter(AdminBroSequelize);
  const adminBro = new AdminBro({
    databases: [db],
    rootPath: "/admin",
    logoutPath: "/admin/exit",
    loginPath: "/admin/login",
    branding: {
      companyName: "Abdelhay",
    },
    resources: [User],
  });

  const ADMIN = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  };

  const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email, password) => {
      if (ADMIN.password === password && ADMIN.email === email) {
        return ADMIN;
      }
      return null;
    },
    cookieName: "adminbro",
    cookiePassword: process.env.ADMIN_COOKIE_PASSWORD,
  });

  app.use(adminBro.options.rootPath, router);
};
