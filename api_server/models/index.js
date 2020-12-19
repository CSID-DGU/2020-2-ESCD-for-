const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const Admin = require('./admin');
const Cafeteria = require('./cafeteria');
const MainDish = require('./mainDish');
const SideDish = require('./sideDish');
const Menu = require('./menu');
const Order = require('./order');
const Sales = require('./sales');
const OrderDetail = require('./orderDetail');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;

db.Admin = Admin;
db.Cafeteria = Cafeteria;
db.MainDish = MainDish;
db.SideDish = SideDish;
db.Menu = Menu;
db.Order = Order;
db.Sales = Sales;
db.OrderDetail = OrderDetail;

Admin.init(sequelize);
Cafeteria.init(sequelize);
MainDish.init(sequelize);
SideDish.init(sequelize);
Menu.init(sequelize);
Order.init(sequelize);
Sales.init(sequelize);
OrderDetail.init(sequelize);

Admin.associate(db);
Cafeteria.associate(db);
MainDish.associate(db);
SideDish.associate(db);
Menu.associate(db);
Order.associate(db);
Sales.associate(db);
OrderDetail.associate(db);

module.exports = db;
