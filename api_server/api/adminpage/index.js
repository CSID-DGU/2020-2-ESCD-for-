const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const loginRouter = require('./login');
const adminRouter = require('./admin');
const cafeteriaRouter = require('./cafeteria');
const sideDishRouter = require('./sideDish');
const menuRouter = require('./menu');
const salesRouter = require('./sales');
const orderRouter = require('./order');

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/login', loginRouter);
router.use('/cafeteria', cafeteriaRouter);
router.use('/side-dish', sideDishRouter);
router.use('/menu', menuRouter);
router.use('/sales', salesRouter);
router.use('/order', orderRouter);

module.exports = router;
