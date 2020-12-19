const express = require("express");
const router = express.Router();
const {
  isLoggedIn,
  isFullyAuth,
  isOfficeAuth,
  isOfficeOrFullAuth,
} = require("../middleware/auth");
const axios = require("axios");
const { baseURL } = require("../utils/axiosConfig");

router.put("/", isLoggedIn, isOfficeOrFullAuth, async (req, res) => {
  console.log("PUT /cafeteria 진입");
  console.dir(req.body);
  try {
    const response = await axios.put(
      `${baseURL}/cafeteria/${req.body.cafeteria_id}`,
      {
        name_ko: req.body.name_ko,
        name_ch: req.body.name_ch,
        business_status: req.body.business_status,
        location: req.body.location,
      },
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );
    return res.status(200).json({
      message: response.data.message,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});
router.patch("/", isLoggedIn, isOfficeAuth, async (req, res) => {
  console.log("PATCH /cafeteria 진입");
  console.dir(req.body);
  try {
    if (req.body.where.cafeteria_id !== req.user.cafeteria_id) {
      throw new Error("허가되지 않은 관리자입니다.");
    }
    const { where, data } = req.body;
    const response = await axios.patch(
      `${baseURL}/cafeteria`,
      {
        where: where,
        data: data,
      },
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );
    console.log("변경 완료");
    console.dir(response.data);
    return res.status(201).json({
      isUpdated: response.data.isUpdated,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
});

router.post("/add", isLoggedIn, isFullyAuth, async (req, res) => {
  const {
    cafeterium_name_ko,
    cafeterium_name_ch,
    cafeterium_location,
  } = req.body;
  try {
    const response = await axios.post(`${baseURL}/cafeteria`, {
      name_ko: cafeterium_name_ko,
      name_ch: cafeterium_name_ch,
      location: cafeterium_location,
    });

    if (response.data.isCreated) {
      res.redirect("/manage-cafeteria?offset=0&limit=10");
    } else {
      res.redirect(`/?e=${encodeURIComponent("이미 존재하는 식당입니다.")}`);
    }
  } catch (error) {
    console.error(error);
  }
});

router.delete("/", isLoggedIn, isFullyAuth, async (req, res) => {
  try {
    const response = await axios.delete(`${baseURL}/cafeteria`, {
      headers: {
        "access-token": req.cookies.auth,
      },
      data: {
        cafeterium_id: req.body.cafeteriaId,
      },
    });

    return res.status(200).json({
      message: response.data.message,
    });
  } catch (error) {
    res.status(400).json({
      message: response.data.message,
    });
  }
});

module.exports = router;
