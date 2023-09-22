"use strict";
const { v4: uuidv4 } = require("uuid");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, isUUID: 4 },
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  User.beforeCreate((option) => (option.id = uuidv4()));

  return User;
};
