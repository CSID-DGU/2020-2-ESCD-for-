const Sequelize = require('sequelize');

module.exports = class Cafeteria extends (
  Sequelize.Model
) {
  static init(sequelize) {
    return super.init(
      {
        cafeteria_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name_ko: {
          type: Sequelize.STRING(50),
          field: 'cafeteria_name_ko',
          allowNull: false,
          unique: true,
        },
        name_ch: {
          type: Sequelize.STRING(50),
          field: 'cafeteria_name_ch',
          allowNull: false,
          unique: true,
        },
        business_status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: 1,
        },
        location: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: true,
        tableName: 'cafeteria',
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Cafeteria.hasMany(db.Admin, {
      foreignKey: 'cafeteria_id',
      onDelete: 'CASCADE',
    });

    db.Cafeteria.hasMany(db.MainDish, {
      foreignKey: 'cafeteria_id',
      onDelete: 'CASCADE',
    });

    db.Cafeteria.hasMany(db.Menu, {
      foreignKey: 'cafeteria_id',
      onDelete: 'CASCADE',
    });

    db.Cafeteria.hasMany(db.Sales, {
      foreignKey: {
        name: 'cafeteria_id',
        primaryKey: true,
        allowNull: false,
      },
      sourceKey: 'cafeteria_id',
      onDelete: 'CASCADE',
    });
  }
};
