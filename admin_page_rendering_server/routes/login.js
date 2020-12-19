const express = require("express");
const router = express.Router();
const { isNotLoggedIn } = require("../middleware/auth");
const axios = require("axios");
const { baseURL } = require("../utils/axiosConfig");

router.get("/", isNotLoggedIn, (req, res) => {
  return res.render("login", {
    title: "로그인 페이지",
    message: req.query.e ? req.query.e : "",
  });
});

router.post("/", async (req, res, next) => {
  const { adminId, password } = req.body;

  try {
    const response = await axios.post(`${baseURL}/login`, {
      id: adminId,
      password: password,
    });

    const { auth: authToken } = response.data;
    let expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1);

    res.cookie("auth", authToken, {
      expires: expireDate,
      secure: false,
      // httpOnly: true,
    });

    return res.redirect("/");
  } catch (err) {
    // 로그인 실패 시
    return res.redirect(
      "/login?e=" + encodeURIComponent(err.response.data.message)
    );
  }
});

module.exports = router;
