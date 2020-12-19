const express = require("express");
const router = express.Router();
const axios = require("axios");

const { baseURL } = require("../utils/axiosConfig");
const {
  isLoggedIn,
  isOfficeAuth,
  isFullyAuth,
  isOfficeOrFullAuth,
  isCookAuth,
} = require("../middleware/auth");
const loginRouter = require("./login");
const joinRouter = require("./join");
const mainRouter = require("./main");
const logoutRouter = require("./logout");
const menuRouter = require("./menu");
const cafeteriaRouter = require("./cafeteria");
const salesRouter = require("./sales");
const orderRouter = require("./order");
const adminRouter = require("./admin");
const { ADMIN_TYPE } = require("../utils/constants");

router.get("/manage-admin", isLoggedIn, isFullyAuth, async (req, res) => {
  try {
    const authToken = req.cookies.auth;
    const response = await axios.get(`${baseURL}/admin`, {
      headers: {
        "access-token": authToken,
      },
    });
    let adminList = response.data.adminList;
    adminList = adminList.map((admin) => {
      return {
        ...admin,
        created_at: new Date(admin.created_at).toLocaleDateString("ko"),
        cafeteria_id: admin.cafeteria_id ? admin.cafeteria_id : "",
        cafeteria_name: admin.Cafeterium ? admin.Cafeterium.name_ko : "",
      };
    });
    console.dir(adminList);
    res.locals.user = req.user;

    return res.render("manageAdmin", {
      title: "관리자 관리 페이지",
      adminList: adminList,
    });
  } catch (err) {
    console.error(err);
    return res.redirect("/");
  }
});

router.get("/manage-cafeteria", isLoggedIn, isFullyAuth, async (req, res) => {
  const { offset, limit } = req.query;
  console.dir(req.query);
  try {
    // 1. 학생 식당의 총 수를 가져온다.
    const countResponse = await axios.get(`${baseURL}/cafeteria/count`, {
      headers: {
        "access-token": req.cookies.auth,
      },
    });

    // 2. 학생 식당의 목록을 가져온다.
    const response = await axios.get(
      `${baseURL}/cafeteria?offset=${offset}&limit=${limit}`,
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );
    console.dir(response.data.cafeteriaList);
    // 3. 식당 관리 페이지를 렌더링한다.
    res.locals.user = req.user;
    return res.render("manageCafeteria", {
      title: "식당 관리 페이지",
      offset: response.data.offset,
      limit: response.data.limit,
      firstPage: 1,
      lastPage: Math.floor(countResponse.data.count / response.data.limit) + 1,
      totalCount: countResponse.data.count,
      cafeteria: response.data.cafeteriaList,
    });
  } catch (error) {
    console.error(error);
    return redirect("/?e=" + encodeURIComponent(`${error.message}`));
  }
});

router.get("/add-cafeteria", isLoggedIn, isFullyAuth, (req, res) => {
  res.locals.user = req.user;
  return res.render("addCafeteria", {
    title: "식당 추가 페이지",
  });
});

router.get("/show-sales", isLoggedIn, isOfficeOrFullAuth, async (req, res) => {
  if (req.query.start_date && req.query.end_date) {
    // 각 사무 관리자 전용 페이지 렌더링
    res.locals.user = req.user;
    return res.render("showSales", {
      title: "매출 확인 페이지",
    });
  } else {
    const dateObj = new Date();
    const startDay =
      dateObj.getDay() > 1
        ? dateObj.getDay() - 1
        : dateObj.getDay() === 1
        ? dateObj.getDay()
        : 1 - dateObj.getDay();
    const endDay =
      dateObj.getDay() < 5
        ? 5 - dateObj.getDay()
        : dateObj.getDay() === 5
        ? dateObj.getDay()
        : dateObj.getDay() - 5;

    const startDate = new Date(
      dateObj.getTime() - startDay * 24 * 60 * 60 * 1000
    );
    const endDate = new Date(dateObj.getTime() + endDay * 24 * 60 * 60 * 1000);

    return res.redirect(
      `/show-sales?start_date=${startDate.getFullYear()}-${
        startDate.getMonth() + 1
      }-${
        (startDate.getDate() + "").length === 1
          ? "0" + startDate.getDate()
          : startDate.getDate()
      }&end_date=${endDate.getFullYear()}-${endDate.getMonth() + 1}-${
        (endDate.getDate() + "").length === 1
          ? "0" + endDate.getDate()
          : endDate.getDate()
      }`
    );
  }
});

router.get("/modify-admin", isLoggedIn, async (req, res) => {
  try {
    const response = await axios.get(`${baseURL}/admin/${req.user.admin_id}`);
    if (!response.data.isExisted) {
      throw new Error("존재하지 않는 관리자입니다.");
    }
    const adminInfo = {
      admin_id: response.data.admin.admin_id,
      created_at: response.data.admin.created_at,
      admin_type:
        response.data.admin.admin_type === ADMIN_TYPE.COOK
          ? "주방 관리"
          : response.data.admin.admin_type === ADMIN_TYPE.OFFICE
          ? "사무 관리"
          : "총 관리",
      cafeterium_name: response.data.admin.Cafeterium
        ? response.data.admin.Cafeterium.name_ko
        : "없음",
    };

    res.locals.user = req.user;
    return res.render("modifyAdmin", {
      title: "관리자 정보 수정 페이지",
      admin: {
        ...adminInfo,
      },
    });

    // });
  } catch (error) {
    return res.redirect(`/?e=${error.message}`);
  }
});

router.get(
  "/modify-cafeteria",
  isLoggedIn,
  isOfficeOrFullAuth,
  async (req, res) => {
    try {
      if (req.query.cafeteriaId) {
        const response = await axios.get(
          `${baseURL}/cafeteria/${req.query.cafeteriaId}`,
          {
            headers: {
              "access-token": req.cookies.auth,
            },
          }
        );
        console.dir(response.data);
        res.locals.user = req.user;
        return res.render("modifyCafeteria", {
          title: "식당 정보 수정 페이지",
          cafeteria: response.data,
        });
      } else {
        throw new Error("올바르지 않은 식당입니다.");
      }
    } catch (error) {
      return res.redirect(`/?e=${error.message}`);
    }
  }
);

router.get("/show-order", isLoggedIn, isCookAuth, async (req, res) => {
  console.log("GET /show-order 진입");
  if (req.query.cafeteriaId) {
    if (parseInt(req.query.cafeteriaId) !== req.user.cafeteria_id) {
      return res.redirect(`/show-order?cafeteriaId=${req.user.cafeteria_id}`);
    }
    console.dir(req.user);
    // 1. 해당 식당의 오늘 주문 완료 처리되지 않은 주문 리스트 가져오기
    const dateObj = new Date();
    const response = await axios.get(
      `${baseURL}/order/cafeteria/${
        req.user.cafeteria_id
      }?order_date=${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${
        (dateObj.getDate() + "").length === 1
          ? "0" + dateObj.getDate()
          : dateObj.getDate()
      }`,
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );
    res.locals.user = req.user;
    return res.render("showOrder", {
      orderListObj: response.data,
      title: "주문 현황 페이지",
    });
  } else {
    return res.redirect(`/show-order?cafeteriaId=${req.user.cafeteria_id}`);
  }
});

router.use("/menu", menuRouter);
router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/join", joinRouter);
router.use("/cafeteria", cafeteriaRouter);
router.use("/sales", salesRouter);
router.use("/order", orderRouter);
router.use("/admin", adminRouter);
router.use("/", mainRouter);

module.exports = router;
