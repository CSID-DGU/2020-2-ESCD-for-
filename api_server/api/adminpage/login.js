const express = require('express');
const { verifyPassword } = require('../../utils/bcryptUtils');
const { Admin, Cafeteria } = require('../../models/');
const { Op } = require('sequelize');
const { generateJWT } = require('../../utils/jwtutils');
const router = express.Router();

/*
 * 로그인을 요청한다.
 * 모든 사용자에게 허용된다.
 */
router.post('/', async (req, res, next) => {
  const { id, password } = req.body;

  try {
    // 1. 아이디와 비밀번호가 DB에 저장되어 있는 정보와 동일한지 비교한다.
    const row = await Admin.findOne({
      attributes: [
        'admin_id',
        'password',
        'admin_type',
        'approval_status',
        'cafeteria_id',
      ],
      include: {
        model: Cafeteria,
      },
      where: {
        admin_id: id,
      },
    });

    // 아이디가 존재하지 않으면
    if (!row) {
      return res.status(400).json({
        message: '아이디를 확인해 주세요.',
      });
    }

    const {
      admin_id,
      password: savedPassword,
      admin_type,
      approval_status,
      cafeteria_id = cafeteria_id ? cafeteria_id : 0,
    } = row.dataValues;

    const isValidPassword = await verifyPassword(password, savedPassword);

    if (!isValidPassword) {
      return res.status(400).json({
        message: '비밀번호를 다시 확인해주세요.',
      });
    }

    if (!approval_status) {
      return res.status(400).json({
        message: '가입 승인되지 않은 관리자입니다.',
      });
    }

    // 3. 비밀번호가 일치하다면 토큰 생성 후 해당 토큰을 응답으로 반환
    const authToken = await generateJWT({
      admin_id: admin_id,
      admin_type: admin_type,
      approval_status: approval_status,
      cafeteria_id: cafeteria_id,
      cafeteria_name: row.Cafeterium ? row.Cafeterium.dataValues.name_ko : '총',
    });

    res.status(200).json({
      auth: authToken,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = router;
