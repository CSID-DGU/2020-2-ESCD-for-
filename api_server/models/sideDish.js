const Sequelize = require('sequelize');

module.exports = class SideDish extends (
  Sequelize.Model
) {
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
          unique: true,
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
        tableName: 'side_dish',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.SideDish.belongsToMany(db.Menu, {
      through: 'menu_side_dish',
      foreignKey: 'side_dish_id',
      timestamps: false,
    });
  }
};
