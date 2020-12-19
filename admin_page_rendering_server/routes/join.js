const express = require("express");
const router = express.Router();
const axios = require("axios");
const { baseURL } = require("../utils/axiosConfig");

router.get("/", async (req, res) => {
  const response = await axios.get(`${baseURL}/cafeteria/name`);
  console.dir(response.data);

  res.render("join", {
    cafeteriaList: response.data,
    adminTypeList: ["주방", "사무"],
    message: req.query.e ? req.query.e : null,
  });
});

router.post("/", async (req, res) => {
  const { adminId, password, cafeteria_id, admin_type } = req.body;
  console.dir(req.body);
  try {
    const joinResult = await axios.post(`${baseURL}/admin`, {
      id: adminId,
      password: password,
      cafeteriaId: cafeteria_id,
      adminType: admin_type,
    });

    console.dir(joinResult.data);
    return res.redirect("/");
  } catch (err) {
    return res.redirect(
      "/join?e=" + encodeURIComponent(err.response.data.message[0].msg)
    );
  }
});

module.exports = router;
