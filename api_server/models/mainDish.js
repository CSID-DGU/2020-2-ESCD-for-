const Sequelize = require('sequelize');

module.exports = class MainDish extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name_ko: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        name_ch: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: 'main_dish',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.MainDish.belongsTo(db.Cafeteria, {
      foreignKey: 'cafeteria_id',
      onDelete: 'CASCADE',
    });

    db.MainDish.hasMany(db.Menu, {
      foreignKey: 'main_dish_id',
      onDelete: 'CASCADE',
    });
  }
};
