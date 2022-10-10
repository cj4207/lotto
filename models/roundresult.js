'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoundResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoundResult.init({
    Date: DataTypes.STRING,
    TotalWinAmt: DataTypes.STRING,
    FirstWinAmt: DataTypes.STRING,
    FirstWinner: DataTypes.INTEGER,
    FirstAccumAmt: DataTypes.INTEGER,
    No1: DataTypes.INTEGER,
    No2: DataTypes.INTEGER,
    No3: DataTypes.INTEGER,
    No4: DataTypes.INTEGER,
    No5: DataTypes.INTEGER,
    No6: DataTypes.INTEGER,
    BonusNo: DataTypes.INTEGER,
    Round: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RoundResult',
  });
  return RoundResult;
};