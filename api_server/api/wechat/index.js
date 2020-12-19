const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const cafeteriaRouter = require('./cafeteria');
const menuRouter = require('./menu');
const payRouter = require('./payment');
const orderRouter = require('./order');

router.use('/auth', authRouter);
router.use('/cafeteria', cafeteriaRouter);
router.use('/menu', menuRouter);
router.use('/payment', payRouter);
router.use('/order', orderRouter);

module.exports = router;
