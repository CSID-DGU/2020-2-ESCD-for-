const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/', async (req, res) => {
  const { 'access-token': receivedToken } = req.headers;
  try {
    const decryptedToken = await jwt.verify(
      receivedToken,
      process.env.JWT_SECRET
    );

    if (decryptedToken) {
      res.status(200).json({
        isAuthorized: true,
        admin_id: decryptedToken.admin_id,
        admin_type: decryptedToken.admin_type,
        approval_status: decryptedToken.approval_status,
        cafeteria_id: decryptedToken.cafeteria_id,
        cafeteria_name: decryptedToken.cafeteria_name,
      });
    } else {
      throw new Error('올바르지 않은 토큰입니다.');
    }
  } catch (err) {
    console.log('catch 진입');
    res.status(400).json({
      isAuthorized: false,
      message: err.message,
    });
  }
});

module.exports = router;
