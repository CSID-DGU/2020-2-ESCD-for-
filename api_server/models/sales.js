const Sequelize = require('sequelize');

module.exports = class Sales extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        // 매출액
        sales: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        // 날짜
        order_date: {
          type: Sequelize.DATE,
          allowNull: false,
          primaryKey: true,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: 'sales',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Sales.belongsTo(db.Cafeteria, {
      foreignKey: {
        name: 'cafeteria_id',
        primarykey: true,
        allowNull: false,
      },
      targetKey: 'cafeteria_id',
    });
  }
};
