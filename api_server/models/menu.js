const Sequelize = require('sequelize');
const OrderDetail = require('./orderDetail');

module.exports = class Menu extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        menu_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        time_classification: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        sales_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        price_krw: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        price_cny: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        sellable_status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        menu_img: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: 'menu',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Menu.belongsToMany(db.SideDish, {
      through: 'menu_side_dish',
      foreignKey: 'menu_id',
      timestamps: false,
      onDelete: 'CASCADE',
    });

    db.Menu.belongsTo(db.MainDish, {
      foreignKey: 'main_dish_id',
      onDlete: 'CASCADE',
    });

    db.Menu.belongsTo(db.Cafeteria, {
      foreignKey: 'cafeteria_id',
      onDelete: 'CASCADE',
    });

    db.Menu.belongsToMany(db.Order, {
      through: OrderDetail,
      foreignKey: 'menu_id',
      allowNull: false,
      timestamps: false,
    });
  }
};
