const express = require('express');
const router = express.Router();
const MenuService = require('../../service/menuService');
const { convertLocalStringToDate } = require('../../utils/dateUtils');
const { query, validationResult, oneOf, param } = require('express-validator');

const menuService = new MenuService();

router.get('/:id', param('id').isInt().toInt(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const result = await menuService.findByMenuId(req.params.id);

    res.status(200).json({
      menu: result.menu,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get(
  '/',
  [
    query('timeClassification')
      .isIn(['점심', '저녁'])
      .withMessage('올바르지 않은 구분입니다.')
      .bail(),
    oneOf([
      query('date').isEmpty(),
      query('date')
        .isDate()
        .customSanitizer((date) => {
          return convertLocalStringToDate(date);
        }),
    ]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.dir(errors);
      return res.status(400).json({
        errors,
      });
    }
    try {
      const {
        cafeteriaName: name_ko,
        date: sales_date,
        timeClassification: time_classification,
      } = req.query;
      console.dir(req.query);

      if (name_ko && sales_date && time_classification) {
        if (name_ko === '전체보기') {
          const result = await menuService.findBySalesDateAndTimeClassification(
            sales_date,
            time_classification
          );
          return res.status(200).json({
            cafeteria: result,
          });
        } else {
          const result = await menuService.findByCafeteriaNameStartingWithAndSalesDateAndTimeClassification(
            name_ko,
            sales_date,
            time_classification
          );
          console.log('result: ');
          console.dir(result);
          return res.status(200).json({
            cafeteria: result,
          });
        }
      } else {
        throw new Error('쿼리 조건이 맞지 않습니다.');
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

// router.get('/', async (req, res) => {
//   try {
//     const result = await cafeteriaService.findAllCafeteria();
//     res.status(200).json(result.cafeteriaList);
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// });

module.exports = router;
