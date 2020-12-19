const express = require("express");
const router = express.Router();
const { isLoggedIn, isFullyAuth } = require("../middleware/auth");
const axios = require("axios");
const { baseURL } = require("../utils/axiosConfig");
const { ADMIN_TYPE } = require("../utils/constants");

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    let date =
      (dateObj.getDate() + "").length === 1
        ? "0" + dateObj.getDate()
        : dateObj.getDate();
    if (req.user.admin_type === ADMIN_TYPE.FULL) {
      // 1. 총 관리자용 메인 화면 설정
      // 1-1. 회원 가입된 관리자 수, 승인되지 않은 관리자 수 가져오기
      const adminCountResponse = await axios.get(`${baseURL}/admin/count`, {
        headers: {
          "access-token": req.cookies.auth,
        },
      });

      // 1-2. 등록된 식당 수 가져오기
      const cafeteriaCountResponse = await axios.get(
        `${baseURL}/cafeteria/count`,
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );

      // 1-3. 등록된 총 메뉴 수 가져오기
      const menuCountResponse = await axios.get(
        `${baseURL}/menu/count?sales_date=${year}-${month}-${date}`,
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );

      res.locals.user = req.user;
      return res.render("main", {
        message: req.query.e ? decodeURIComponent(req.query.e) : null,
        count_of_total_admin: adminCountResponse.data.totalCount,
        count_of_unauthorized_admin: adminCountResponse.data.notApprovedCount,
        count_of_cafeteria: cafeteriaCountResponse.data.count,
        count_of_menus: menuCountResponse.data.count,
        title: "메인 페이지",
      });
    } else if (req.user.admin_type === ADMIN_TYPE.OFFICE) {
      // 2. 사무 관리자용 메인 화면 설정
      // 2-1. 오늘 등록된 메뉴의 수 가져오기
      console.log("사무 관리자 로그인");
      const menuResponse = await axios.get(
        `${baseURL}/menu/count/?cafeteriaId=${req.user.cafeteria_id}&sales_date=${year}-${month}-${date}`,
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );

      const countOfTodaysMenu = menuResponse.data.count;
      // 2-2. 오늘 매출액 가져오기
      const amountResponse = await axios.get(
        `${baseURL}/sales/amount?cafeteriaId=${req.user.cafeteria_id}&date=${year}-${month}-${date}`,
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );
      console.dir(amountResponse.data);

      // 2-3. 영업 정지 상태 가져오기
      const cafeteriaResponse = await axios.get(
        `${baseURL}/cafeteria/${req.user.cafeteria_id}`,
        {
          headers: {
            "access-token": req.cookies.auth,
          },
        }
      );
      const businessStatus = cafeteriaResponse.data.business_status;

      res.locals.user = req.user;
      return res.render("main", {
        message: req.query.e ? decodeURIComponent(req.query.e) : null,
        title: "메인 페이지",
        countOfTodaysMenu: countOfTodaysMenu,
        salesAmount: amountResponse.data.amount,
        businessStatus: businessStatus,
      });
    } else if (req.user.admin_type === ADMIN_TYPE.COOK) {
      // 3. 주방 관리자용 메인 화면 설정
      console.log("cook: ");
      console.dir(req.user);
      return res.redirect(`/show-order?cafeteriaId=${req.user.cafeteria_id}`);
    }
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
