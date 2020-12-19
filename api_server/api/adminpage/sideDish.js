const express = require('express');
const { SideDish } = require('../../models');
const { Op } = require('sequelize');

const router = express.Router();

/*
 * 전체 반찬 정보를 요청한다(autocomplete에 사용).
 * 사무 관리자들에게 허용된다.
 */
router.get('/:part', async (req, res) => {
  const decodedPart = decodeURIComponent(req.params.part); // 인코딩되어 넘어온 이름 일부분을 디코딩함.
  console.log('decodedPart: ' + decodedPart);
  try {
    const sideDishList = await SideDish.findAll({
      where: {
        name: {
          [Op.like]: `%${decodedPart}%`,
        },
      },
    });

    res.status(200).json({
      sideDishList,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = router;
