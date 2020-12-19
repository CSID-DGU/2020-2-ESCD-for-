const express = require("express");
const { check, validationResult, param, query } = require("express-validator");
const router = express.Router();
const OrderService = require("../../service/orderService");
const {
  getDate,
  getMidNighOfDate,
  dateTimeToStr,
} = require("../../utils/dateUtils");

const orderService = new OrderService();

router.get(
  "/detail/:orderNumber",
  [
    param("orderNumber")
      .isInt()
      .withMessage("order number is not vaild.")
      .toInt(),
    query("openid")
      .isString()
      .notEmpty()
      .withMessage("openid is not valid.")
      .custom(async (val, { req }) => {
        const isValid = await orderService.checkByOrderNumberAndOpenId(
          req.params.orderNumber,
          req.query.openid
        );
        return isValid;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    console.dir(req.params);
    console.dir(req.query);
    try {
      const orderList = await orderService.findByOrderNumber(
        req.params.orderNumber
      );
      console.dir(orderList);
      const result = orderList.map((item) => ({
        ...item,
        order_date: dateTimeToStr(item.order_date),
      }));
      return res.status(200).json({
        result,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

router.get("/:openid", async (req, res) => {
  try {
    const { openid } = req.params;

    const orderList = await orderService.findByOpenId(openid);
    const result = {};
    orderList.forEach((item) => {
      const order = {
        ...item,
        order_date: dateTimeToStr(item.order_date),
      };
      if (result[order.order_number]) {
        result[order.order_number].push(order);
      } else {
        result[order.order_number] = [{ ...order }];
      }
    });
    return res.status(200).json({
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

router.post(
  "/",
  [
    check("openid").trim().notEmpty(),
    check("amount").isInt().toInt(),
    check("cartList").isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const io = req.app.get("io");
      const { cartList, openid: open_user_id, amount } = req.body;
      const orderList = {};
      // 1. 식당 별 주문 리스트를 분리함.
      for (cartItem of cartList) {
        if (orderList[cartItem.cafeteriaId]) {
          orderList[cartItem.cafeteriaId].push({
            menu_id: cartItem.menuId,
            mainDish_kor: cartItem.mainDish_kor,
            quantity: cartItem.quantity,
            price: cartItem.price_krw,
          });
        } else {
          orderList[cartItem.cafeteriaId] = [
            {
              menu_id: cartItem.menuId,
              mainDish_kor: cartItem.mainDish_kor,
              quantity: cartItem.quantity,
              price: cartItem.price_krw,
            },
          ];
        }
      }

      const result = await Promise.all(
        Object.keys(orderList).map(async (cafeteriaId) => {
          cafeteriaId = parseInt(cafeteriaId);
          try {
            // 식권 번호 발급
            const ticketNumber = await orderService.nextMealTicketNumber(
              cafeteriaId
            );
            const orderDateTime = getDate();

            const orderResult = await orderService.order(
              cafeteriaId,
              ticketNumber,
              orderDateTime,
              open_user_id,
              orderList[cafeteriaId]
            );
            orderList[cafeteriaId].orderNumber =
              orderResult.dataValues.order_number;
            orderList[cafeteriaId].ticketNumber = ticketNumber;
            orderList[cafeteriaId].orderDateTime = orderDateTime;

            return {
              cafeteriaId: cafeteriaId,
              ticketNumber: ticketNumber,
              orderDateTime: orderDateTime,
            };
          } catch (error) {
            console.error(error);
            return { cafeteriaId: cafeteriaId, message: error.message };
          }
        })
      );
      console.log("orderList: ");
      console.dir(orderList);

      Object.keys(orderList).forEach(async (cafeteriaId) => {
        io.to(`cafeterium${cafeteriaId}`).emit("order", {
          open_user_id: open_user_id,
          ticketNumber: orderList[cafeteriaId].ticketNumber,
          orderDateTime: orderList[cafeteriaId].orderDateTime,
          orderList: orderList[cafeteriaId],
          orderNumber: orderList[cafeteriaId].orderNumber,
        });
      });

      console.dir(orderList);
      const orderResult = {};
      Object.keys(orderList).forEach((cafeteriaId) => {
        orderResult[cafeteriaId] = {};
        orderResult[cafeteriaId].ticketNumber =
          orderList[cafeteriaId].ticketNumber;
        orderResult[cafeteriaId].orderDateTime =
          orderList[cafeteriaId].orderDateTime;
      });

      return res.status(201).json({
        orderResult,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;
