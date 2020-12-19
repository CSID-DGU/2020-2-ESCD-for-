const express = require("express");
const axios = require("axios");
const { isLoggedIn, isCookAuth } = require("../middleware/auth");
const { baseURL } = require("../utils/axiosConfig");
const router = express.Router();

router.post("/notify", isLoggedIn, isCookAuth, async (req, res) => {
  console.log("/order/notify POST 진입");
  try {
    const response = await axios.post(
      `${baseURL}/order/notify`,
      {
        orderNumber: req.body.orderNumber,
      },
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );
    console.dir(response.data);
    return res.status(200).json({
      message: response.data.message,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

// 주문 완료 처리하기
router.patch("/", isLoggedIn, isCookAuth, async (req, res) => {
  console.log("/order PATCH 진입");
  console.dir(req.body);
  try {
    const response = await axios.patch(
      `${baseURL}/order`,
      {
        orderNumber: req.body.orderNumber,
      },
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );

    console.dir(response.data);
    return res.status(200).json({
      ...response.data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

router.delete("/", isLoggedIn, isCookAuth, async (req, res) => {
  try {
    console.log("DELETE /order 진입");
    console.dir(req.body);
    const response = await axios.delete(`${baseURL}/order`, {
      data: {
        orderNumber: req.body.orderNumber,
      },
      headers: {
        "access-token": req.cookies.auth,
      },
    });
    console.dir(response.data);
    return res.status(200).json({
      message: "주문 취소 성공",
    });
  } catch (error) {
    return res.status(400).json({
      message: "주문 취소 실패",
    });
  }
});

module.exports = router;
