const express = require("express");
const { isAuthenticated, isCookAdmin } = require("../../middlewares/auth");
const OrderService = require("../../service/orderService");
const { dateTimeToStr } = require("../../utils/dateUtils");
const { body } = require("express-validator");
const axios = require("axios");
const router = express.Router();

const orderService = new OrderService();

router.post("/notify", isAuthenticated, isCookAdmin, async (req, res) => {
  try {
    const { orderNumber } = req.body;
    const tokenResponse = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.APP_ID}&secret=${process.env.APP_SECRET}`
    );
    console.dir(tokenResponse.data);
    const { access_token } = tokenResponse.data;
    const orderRecord = await orderService.findByOrderNumber(orderNumber);
    console.dir(orderRecord);
    const orderInfo = `${orderRecord.map((item) => item.name_ch).join(", ")}`;
    console.log("orderInfo: " + orderInfo);
    const subscribedMessageResponse = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
      {
        touser: orderRecord[0].order_user_id,
        template_id: process.env.TEMPLATE_ID,
        data: {
          character_string1: {
            value: `${orderRecord[0].meal_ticket_number}`, // 식권 번호
          },
          thing2: {
            value: orderInfo,
          },
          thing3: {
            value: `${orderRecord[0].cafeteria_name_ch} (${orderRecord[0].cafeteria_name_ko})`,
          },
        },
      }
    );
    console.dir(subscribedMessageResponse);
    return res.status(200).json({
      message: "알림 보내기 완료",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message,
    });
  }
});

// 주문 완료 처리하기
router.patch(
  "/",
  isAuthenticated,
  isCookAdmin,
  [body("orderNumber").isInt().toInt()],
  async (req, res) => {
    try {
      const result = await orderService.updateIsRecivedByOrderNumber(
        req.body.orderNumber
      );

      console.dir(result);

      return res.status(200).json({
        message: "주문 완료 처리 완료",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

router.get(
  "/cafeteria/:cafeteriaId",
  isAuthenticated,
  isCookAdmin,
  async (req, res) => {
    console.log(`/order/cafeteria/${req.params.cafeteriaId} 진입`);
    try {
      if (req.query.order_date) {
        const orders = await orderService.findNotReceivedOrderByCafeteriaIdAndOrderDate(
          req.user.cafeteria_id,
          req.query.order_date
        );
        const result = {};
        orders.forEach((order) => {
          if (result[order.order_number]) {
            result[order.order_number].push({
              ...order,
              order_date: dateTimeToStr(order.order_date),
              sales_date: dateTimeToStr(order.sales_date),
            });
          } else {
            result[order.order_number] = [
              {
                ...order,
                order_date: dateTimeToStr(order.order_date),
                sales_date: dateTimeToStr(order.sales_date),
              },
            ];
          }
        });

        return res.status(200).json({
          ...result,
        });
      } else {
        throw new Error("order date를 보내야 합니다.");
      }
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

// 주문 취소 처리
router.delete("/", isAuthenticated, isCookAdmin, async (req, res) => {
  try {
    console.log("DELETE /order 진입");
    console.dir(req.body);
    const cancelResult = orderService.cancelByOrderNumber(req.body.orderNumber);
    const tokenResponse = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.APP_ID}&secret=${process.env.APP_SECRET}`
    );
    console.dir(tokenResponse.data);
    const { access_token } = tokenResponse.data;
    const orderRecord = await orderService.findByOrderNumber(
      req.body.orderNumber
    );
    console.dir(orderRecord);
    const orderInfo = `${orderRecord.map((item) => item.name_ch).join(", ")}`;
    console.log("orderInfo: " + orderInfo);
    const subscribedMessageResponse = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${access_token}`,
      {
        touser: orderRecord[0].order_user_id,
        template_id: process.env.TEMPLATE_ID,
        data: {
          character_string1: {
            value: `${orderRecord[0].meal_ticket_number}`, // 식권 번호
          },
          thing2: {
            value: "您的订单已被取消.",
          },
          thing3: {
            value: `${orderRecord[0].cafeteria_name_ch} (${orderRecord[0].cafeteria_name_ko})`,
          },
        },
      }
    );
    console.dir(subscribedMessageResponse);
    return res.status(200).json({
      message: "주문 취소 완료",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
