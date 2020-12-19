const axios = require('axios');

// const WECHAT_URL =
//   'https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=temporaryCode&grant_type=authorization_code';

const PAY_URL = 'https://open.ifprod.cc/api/v1/shoots/pay';

class WechatService {
  async login(code) {
    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.APP_ID}&secret=${process.env.APP_SECRET}&js_code=${code}&grant_type=authorization_code`
      );
      return {
        session_key: response.data.session_key,
        openid: response.data.openid,
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async payment(openId, amount) {
    try {
      const response = await axios.post(PAY_URL, {
        openId: openId,
        amount: amount,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

module.exports = WechatService;
