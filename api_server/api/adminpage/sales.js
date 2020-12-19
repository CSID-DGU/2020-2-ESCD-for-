const express = require('express');
const {
  isAuthenticated,
  isFullAdmin,
  isOfficeAdmin,
  isOfficeOrFullAdmin,
} = require('../../middlewares/auth');
const { oneOf, query, validationResult, check } = require('express-validator');
const {
  getMidNighOfDate,
  dateToStr,
  getDate,
  stringToDate,
} = require('../../utils/dateUtils');
const router = express.Router();
const CafeteriaService = require('../../service/cafeteriaService');
const SalesService = require('../../service/salesService');
const { default: Axios } = require('axios');

const cafeteriaService = new CafeteriaService();
const salesService = new SalesService();

function amountWithCommas(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

router.get(
  '/cafeteria/:cafeteriaId',
  isAuthenticated,
  isOfficeAdmin,
  [
    check('cafeteriaId')
      .isInt()
      .withMessage('올바르지 않은 식당 번호입니다.')
      .bail()
      .toInt(),
    oneOf([
      query('start_date').isEmpty(),
      query('start_date').custom((start_date, { req }) => {
        console.dir(req.query);
        const startDateObj = stringToDate(req.query.start_date);
        const endDateObj = stringToDate(req.query.end_date);
        if (startDateObj < endDateObj) {
          return true;
        } else {
          return Promise.reject('조회 날짜가 올바르지 않습니다.');
        }
      }),
    ]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    if (req.query.start_date && req.query.end_date) {
      // 해당 식당의 한 주간 매출 반환
      const result = await cafeteriaService.findSalesByCafeteriaIdAndIntervalDate(
        req.params.cafeteriaId,
        req.query.start_date,
        req.query.end_date
      );
      const data = Object.keys(result).map((date) => ({
        date: date,
        sales: result[date],
      }));
      return res.status(200).json({
        data,
      });
    }

    if (req.query.date) {
      // 해당 식당의 특정 날짜의 매출 반환
      const result = await cafeteriaService.findMenuAndSalesByDateAndCafeteriaId(
        req.user.cafeteria_id,
        req.query.date
      );

      return res.status(200).json({
        result: result.map((row) => ({
          ...row,
          sales_date: dateToStr(row.sales_date),
        })),
      });
    }
  }
);

router.get('/cafeteria', isAuthenticated, isFullAdmin, async (req, res) => {
  try {
    const result = await cafeteriaService.findSalesOfCafeteriaByStartDateAndEndDate(
      req.query.start_date,
      req.query.end_date
    );
    return res.status(200).json({
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

router.get(
  '/amount',
  isAuthenticated,
  isOfficeOrFullAdmin,
  [query('cafeteriaId').isInt().toInt()],
  async (req, res) => {
    console.log('GET /sales/amount 진입');
    console.dir(req.query);
    console.dir(req.params);
    try {
      const rows = await cafeteriaService.findSumOfAmountByDateAndCafeteriaId(
        req.query.cafeteriaId,
        req.query.date
      );
      console.dir(rows[0]);
      return res.status(200).json({
        amount: rows[0].amount ? amountWithCommas(parseInt(rows[0].amount)) : 0,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

router.get(
  '/:cafeteriaId',
  isAuthenticated,
  isOfficeOrFullAdmin,
  async (req, res) => {
    console.log('/sales/:cafeteriaId 진입');
    console.dir(req.query);
    console.dir(req.params);
  }
);

router.get('/', isAuthenticated, isFullAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    if (req.query.date) {
      const salesResult = await salesService.findByDate(
        stringToDate(req.query.date)
      );
      return res.status(200).json({
        count: salesResult.count,
        salesResult: salesResult.rows.map((row) => ({
          sales: row.dataValues.sales,
          date: dateToStr(row.dataValues.order_date),
          cafeterium: row.Cafeterium,
        })),
      });
    } else {
      const salesResult = await cafeteriaService.findCafeteriaAndSalesByDate(
        getMidNighOfDate()
      );
      return res.status(200).json({
        count: salesResult.count,
        salesResult: salesResult.rows.map((row) => ({
          cafeteria_id: row.cafeteria_id,
          cafeteria_name_ko: row.cafeteria_name_ko,
          cafeteria_name_ch: row.cafeteria_name_ch,
          business_status: row.business_status,
          location: row.location,
          sales: row.sales,
          date: dateToStr(row.order_date),
        })),
      });
    }
  } catch (error) {}
});

module.exports = router;
