'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RoundResults', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Date: {
        type: Sequelize.STRING
      },
      TotalWinAmt: {
        type: Sequelize.STRING
      },
      FirstWinAmt: {
        type: Sequelize.STRING
      },
      FirstWinner: {
        type: Sequelize.INTEGER
      },
      FirstAccumAmt: {
        type: Sequelize.INTEGER
      },
      No1: {
        type: Sequelize.INTEGER
      },
      No2: {
        type: Sequelize.INTEGER
      },
      No3: {
        type: Sequelize.INTEGER
      },
      No4: {
        type: Sequelize.INTEGER
      },
      No5: {
        type: Sequelize.INTEGER
      },
      No6: {
        type: Sequelize.INTEGER
      },
      BonusNo: {
        type: Sequelize.INTEGER
      },
      Round: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RoundResults');
  }
};