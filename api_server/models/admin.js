const Sequelize = require('sequelize');

module.exports = class Admin extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        admin_id: {
          type: Sequelize.STRING(30),
          primaryKey: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        admin_type: {
          type: Sequelize.SMALLINT,
          allowNull: false,
        },
        approval_status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        tableName: 'admin',
        underscored: true,
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Admin.belongsTo(db.Cafeteria, {
      foreignKey: {
        name: 'cafeteria_id',
        allowNull: true,
      },
      onDelete: 'CASCADE',
    });
  }
};
