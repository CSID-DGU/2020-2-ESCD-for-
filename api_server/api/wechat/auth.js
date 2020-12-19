const express = require('express');
const axios = require('axios');
const router = express.Router();
const WechatService = require('../../service/wechatService');

const wechatService = new WechatService();

const WECHAT_URL =
  'https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=temporaryCode&grant_type=authorization_code';

router.post('/', async (req, res) => {
  console.dir(req.body);
  const { code } = req.body;

  try {
    const result = await wechatService.login(code);
    console.log('result: ');
    console.dir(result);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
