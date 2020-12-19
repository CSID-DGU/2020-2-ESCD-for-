const express = require("express");
const { isLoggedIn, isFullyAuth } = require("../middleware/auth");
const router = express.Router();
const axios = require("axios");
const { baseURL } = require("../utils/axiosConfig");

router.delete("/", isLoggedIn, isFullyAuth, async (req, res) => {
  try {
    const response = await axios.delete(`${baseURL}/admin`, {
      data: {
        adminId: req.body.adminId,
      },
      headers: {
        "access-token": req.cookies.auth,
      },
    });
    return res.status(200).json({
      message: "탈퇴 완료",
    });
  } catch (error) {
    return res.status(400).json({
      message: error.mesage,
    });
  }
});

router.patch("/", isLoggedIn, async (req, res) => {
  try {
    if (req.body.requestApproval) {
      const response = await axios.patch(
        `${baseURL}/admin`,
        {
          requestApproval: true,
          adminId: req.body.admin_id,
        },
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );
      return res.status(200).json({
        message: "가입 승인 처리 완료",
      });
    } else {
      if (req.user.admin_id === req.body.admin_id) {
        const response = await axios.patch(
          `${baseURL}/admin`,
          {
            adminId: req.body.admin_id,
            password: req.body.password,
            requestModify: true,
          },
          {
            headers: {
              "access-token": req.cookies.auth,
            },
          }
        );
        return res.status(200).json({
          message: "수정이 완료되었습니다.",
        });
      } else {
        throw new Error("정보를 수정할 수 없습니다.");
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
