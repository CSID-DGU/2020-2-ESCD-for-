const express = require("express");
const { isLoggedIn, isFullyAuth, isOfficeAuth } = require("../middleware/auth");
const router = express.Router();
const { baseURL } = require("../utils/axiosConfig");
const axios = require("axios");

router.get(
  "/cafeteria/:cafeteriaId",
  isLoggedIn,
  isOfficeAuth,
  async (req, res) => {
    if (req.query.start_date && req.query.end_date) {
      try {
        const response = await axios.get(
          `${baseURL}/sales/cafeteria/${req.user.cafeteria_id}?start_date=${req.query.start_date}&end_date=${req.query.end_date}`,
          {
            headers: {
              "access-token": req.cookies.auth,
            },
          }
        );
        console.log("responsedata: ");
        console.dir(response.data);
        return res.status(200).json({
          ...response.data,
        });
      } catch (error) {
        console.dir(error.response.data.errors[0].msg);
        return res.status(400).json({
          message: error.response.data.errors[0].msg,
        });
      }
    }
    if (req.query.date) {
      const response = await axios.get(
        `${baseURL}/sales/cafeteria/${req.params.cafeteriaId}?date=${req.query.date}`,
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );
    } else {
      const dateObj = new Date();
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const date =
        (dateObj.getDate() + "").length === 1
          ? "0" + dateObj.getDate()
          : dateObj.getDate();

      const response = await axios.get(
        `${baseURL}/sales/cafeteria/${req.params.cafeteriaId}?date=${year}-${month}-${date}`,
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );
      return res.status(200).json({
        salesResult: response.data.result,
      });
    }
  }
);

router.get("/cafeteria", isLoggedIn, isFullyAuth, async (req, res) => {
  console.log("/cafeteria GET 진입");
  if (req.query.start_date && req.query.end_date) {
    console.dir(req.query);
    try {
      const response = await axios.get(
        `${baseURL}/sales/cafeteria/?start_date=${req.query.start_date}&end_date=${req.query.end_date}`,
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
  }
});

router.get("/", isLoggedIn, isFullyAuth, async (req, res, next) => {
  try {
    if (req.query.date) {
      const response = await axios.get(
        `${baseURL}/sales?date=${req.query.date}`,
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );
      return res.status(200).json(response.data);
    } else {
      const response = await axios.get(`${baseURL}/sales`, {
        headers: {
          "access-token": req.cookies.auth,
        },
      });
      return res.status(200).json({
        count: response.data.count,
        salesResult: response.data.salesResult,
      });
    }
  } catch (error) {
    console.error(error);
    next("error");
  }
});

module.exports = router;
