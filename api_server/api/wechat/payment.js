const express = require('express');
const axios = require('axios');
const router = express.Router();
const WechatService = require('../../service/wechatService');

const wechatService = new WechatService();

router.post('/', async (req, res) => {
  console.log('req.body: ');
  console.dir(req.body);
  const { code, amount } = req.body;
  try {
    const { openid, session_key } = await wechatService.login(code);
    const paymentResult = await wechatService.payment(openid, amount);

    res.status(200).json({
      openid: openid,
      result: paymentResult,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
