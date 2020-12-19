const Sequelize = require('sequelize');

module.exports = class OrderDetail extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: 'order_detail',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.OrderDetail.belongsTo(db.Order, {
      foreignKey: 'order_number',
      allowNull: false,
      onDlete: 'CASCADE',
    });
    db.OrderDetail.belongsTo(db.Menu, {
      foreignKey: 'menu_id',
      allowNull: false,
      onDelete: 'CASCADE',
    });
  }
};
