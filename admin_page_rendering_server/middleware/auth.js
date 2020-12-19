const axios = require("axios");

const { ADMIN_TYPE, APPROVAL_STATUS } = require("../utils/constants");
const { baseURL } = require("../utils/axiosConfig");

// 로그인이 되어있는지 확인
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.auth) {
    try {
      const response = await axios.get(`${baseURL}/auth`, {
        headers: { "access-token": req.cookies.auth },
      });

      if (response.data.isAuthorized) {
        req.user = {
          admin_id: response.data.admin_id,
          admin_type: response.data.admin_type,
          cafeteria_id: response.data.cafeteria_id,
          cafeteria_name: response.data.cafeteria_name,
        };
        next();
      } else {
        throw new Error("로그인을 다시 해주세요.");
      }
      next();
    } catch (err) {
      // return res.redirect(
      //   "/login?e=" + encodeURIComponent("로그인을 다시 해주세요")
      // );
      console.log("에러가 발생해서 login 페이지로 리다이렉트");
      return res.redirect("/login");
    }
  } else {
    console.log("login 페이지로 리다이렉트");
    return res.redirect("/login");
  }
};

// 로그인이 안되어있는지 확인
const isNotLoggedIn = async (req, res, next) => {
  if (!req.cookies.auth) {
    console.log("비로그인 확인");
    next();
  } else {
    return res.redirect(
      "/?e=" + encodeURIComponent("이미 로그인되어 있습니다.")
    );
  }
};

// 관리자 타입이 사무인지 확인
const isOfficeAuth = (req, res, next) => {
  if (req.user.admin_type == ADMIN_TYPE.OFFICE) {
    console.log("사무 관리자 확인");
    next();
  } else {
    return res.redirect(
      "/?e=" + encodeURIComponent("사무 관리자 권한이 없습니다.")
    );
  }
};

// 관리자 타입이 주방인지 확인
const isCookAuth = async (req, res, next) => {
  if (req.user.admin_type == ADMIN_TYPE.COOK) {
    console.log("주방 관리자 확인");
    next();
  } else {
    return res.redirect(
      "/?e=" + encodeURIComponent("주방 관리자 권한이 없습니다.")
    );
  }
};

// 전체 관리자 권한을 가졌는지 확인
const isFullyAuth = async (req, res, next) => {
  if (req.user.admin_type == ADMIN_TYPE.FULL) {
    console.log("총 관리자 확인");
    next();
  } else {
    return res.redirect(
      "/?e=" + encodeURIComponent("총 관리자 권한이 없습니다.")
    );
  }
};

const isOfficeOrCookAuth = async (req, res, next) => {
  if (
    req.user.admin_type === ADMIN_TYPE.COOK ||
    req.user.admin_type === ADMIN_TYPE.OFFICE
  ) {
    next();
  } else {
    return res.redirect(
      "/?e=" +
        encodeURIComponent("주방 관리자 또는 사무 관리자 권한이 없습니다.")
    );
  }
};

const isOfficeOrFullAuth = async (req, res, next) => {
  if (
    req.user.admin_type === ADMIN_TYPE.FULL ||
    req.user.admin_type === ADMIN_TYPE.OFFICE
  ) {
    next();
  } else {
    return res.redirect(
      "/?e=" + encodeURIComponent("총 관리자 또는 사무 관리자 권한이 없습니다.")
    );
  }
};

module.exports = {
  isLoggedIn,
  isNotLoggedIn,
  isOfficeAuth,
  isCookAuth,
  isFullyAuth,
  isOfficeOrFullAuth,
  isOfficeOrCookAuth,
};
