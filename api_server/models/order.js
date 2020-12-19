const Sequelize = require('sequelize');
const OrderDetail = require('./orderDetail');

module.exports = class Order extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        // 식권 번호
        order_number: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        meal_ticket_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        // 주문날짜
        order_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        // 메뉴 수령 여부
        is_received: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        // 주문 유저 아이디
        order_user_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: 'order',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Order.belongsTo(db.Cafeteria, {
      foreignKey: {
        name: 'cafeteria_id',
        allowNull: false,
      },
      targetKey: 'cafeteria_id',
    });

    db.Order.belongsToMany(db.Menu, {
      through: OrderDetail,
      foreignKey: 'order_number',
      allowNull: false,
      timestamps: false,
      onDelete: 'CASCADE',
    });
  }
};
