const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log("logout 진입");
  res.cookie("auth", null, {
    maxAge: 0,
    httpOnly: true,
  });

  res.redirect("/login");
});

module.exports = router;
