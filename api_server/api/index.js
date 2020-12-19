const express = require('express');
const router = express.Router();

const adminPageRouter = require('./adminpage');
const wechatRouter = require('./wechat');

router.use('/adminpage', adminPageRouter);
router.use('/wechat', wechatRouter);

module.exports = router;
