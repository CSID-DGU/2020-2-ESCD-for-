const express = require("express");
const router = express.Router();
const path = require("path");
const AWS = require("aws-sdk");
// const multer = require("multer");
// const { UPLOAD_PATH } = require("../utils/constants");
// const multerStorage = multer.memoryStorage();
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, `${UPLOAD_PATH}`);
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       path.basename(file.originalname, path.extname(file.originalname)) +
//         "_" +
//         Date.now() +
//         path.extname(file.originalname)
//     );
//   },
// });
const {
  isLoggedIn,
  isOfficeAuth,
  isOfficeOrCookAuth,
} = require("../middleware/auth");
const { baseURL } = require("../utils/axiosConfig");
const axios = require("axios");
const { ADMIN_TYPE } = require("../utils/constants");

// 메뉴 보기 페이지 렌더링
router.get("/show", isLoggedIn, async (req, res, next) => {
  // 1. 해당 날짜의 메뉴를 API 서버에 요청한다.
  console.log("/show 진입");
  let query_date;

  if (req.query.date) {
    query_date = req.query.date;
  } else {
    const dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    let date =
      (dateObj.getDate() + "").length === 1
        ? "0" + dateObj.getDate()
        : dateObj.getDate();
    query_date = `${year}-${month}-${date}`;
  }
  try {
    const response = await axios.get(
      `${baseURL}/menu?cafeteriaId=${req.user.cafeteria_id}&sales_date=${query_date}`,
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );

    console.log("메뉴 보기 response: ");
    const menuList = response.data.menuList;

    res.locals.user = req.user;
    res.render("showmenu", {
      title: "메뉴 보기 페이지",
      menuList: menuList,
      date: query_date,
    });
  } catch (error) {
    console.error(error);
  }
});

// 메뉴 추가 페이지 렌더링
router.get("/add", isLoggedIn, isOfficeAuth, (req, res, next) => {
  res.locals.user = req.user;
  res.render("addmenu", {
    title: "메뉴 추가 페이지",
    message: req.query.e ? req.query.e : "",
  });
});

// upload 다음에 바로 파일 업로드하는 라우터 부분이 나와야 함.
// const upload = multer({
//   storage: multerStorage,
//   fileFilter: fileExtensionFilter,
// }).single("menu-img");

const upload = require("../utils/imageUpload").single("menu-img");

// 메뉴 추가 요청 보내기
router.post("/add", isLoggedIn, isOfficeAuth, async (req, res, next) => {
  try {
    upload(req, res, async function (error) {
      if (error) {
        console.log("업로드 도중 에러 발생:");
        console.error(error);
        throw new Error(error.message);
      }
      console.dir(req.file);
      console.dir(req.body);

      const data = {
        main_dish_ko: req.body.main_dish_ko,
        main_dish_ch: req.body.main_dish_ch,
        side_dishes_ko: Array.isArray(req.body.side_dish_ko)
          ? req.body.side_dish_ko
          : req.body.side_dish_ko
          ? [req.body.side_dish_ko]
          : "",
        side_dishes_ch: Array.isArray(req.body.side_dish_ch)
          ? req.body.side_dish_ch
          : req.body.side_dish_ch
          ? [req.body.side_dish_ch]
          : "",
        menu_price: req.body.menu_price,
        selling_date: [...req.body.selling_date.split(", ")],
        classifications: Array.isArray(req.body.classification)
          ? req.body.classification
          : [req.body.classification],
        // img_path: path.join(path.dirname(require.main.filename), req.file.path),
        img_path: req.file.location,
      };

      try {
        const response = await axios.post(
          `${baseURL}/menu`,
          {
            cafeteria_id: req.user.cafeteria_id,
            ...data,
          },
          {
            headers: {
              "access-token": req.cookies.auth,
            },
          }
        );
        console.dir(response.data);
        return res.redirect("/");
      } catch (error) {
        const message = error.response.data.errors[0].msg;
        return res.redirect("/menu/add?e=" + encodeURIComponent(message));
      }
    });
    // return res.redirect("/");
  } catch (error) {
    console.log("에러 진입");
    console.error(error);
  }
});

router.get("/modify", isLoggedIn, async (req, res, next) => {
  const { menu: menu_id, cafeteria: cafeteria_id } = req.query;
  console.log("menu_id: " + menu_id);
  console.log("cafeteria_id: " + cafeteria_id);

  try {
    if (parseInt(cafeteria_id) !== req.user.cafeteria_id) {
      throw new Error("해당 식당의 메뉴를 수정할 권한이 없습니다.");
    }

    const response = await axios.get(`${baseURL}/menu/${menu_id}`, {
      headers: {
        "access-token": req.cookies.auth,
      },
    });
    console.dir(response.data);
    // console.dir(response.data.menu);
    // console.dir(response.data.menu.SideDishes);
    // console.dir(response.data.menu.MainDish);

    const menu = {
      cafeteria_id: response.data.cafeteria_id,
      menu_id: response.data.menu_id,
      time_classification: response.data.time_classification,
      price: response.data.price_krw,
      sellable_status: response.data.sellable_status,
      main_dish_ko: response.data.MainDish.name_ko,
      main_dish_ch: response.data.MainDish.name_ch,
      sales_date: response.data.sales_date,
      side_dishes: Array.isArray(response.data.SideDishes)
        ? response.data.SideDishes.map((sideDish) => ({
            name_ko: sideDish.name_ko,
            name_ch: sideDish.name_ch,
          }))
        : [
            {
              name_ko: response.data.SideDishes.name_ko,
              name_ch: response.data.SideDishes.name_ch,
            },
          ],
    };
    console.dir(menu);
    res.locals.user = req.user;
    res.render("modifymenu", {
      title: "메뉴 수정 페이지",
      menu: menu,
    });
  } catch (err) {
    console.log("/menu/modify GET에서 에러 발생");
    console.error(err);
    next(err);
  }
});

router.post("/modify", isLoggedIn, isOfficeOrCookAuth, async (req, res) => {
  try {
    const response = await axios.patch(
      `${baseURL}/menu`,
      {
        ...req.body,
      },
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );
    return res.redirect("/");
  } catch (error) {
    console.log("error: ");
    console.dir(error);
    return res.redirect(
      `/?e=${decodeURIComponent(error.response.data.message)}`
    );
  }

  // res.redirect("/menu/show");
});

router.get("/delete", isLoggedIn, isOfficeOrCookAuth, async (req, res) => {
  console.log("GET /menu/delete 진입");
  let { menuId, date } = req.query;
  menuId = parseInt(menuId);
  const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  });

  // 해당 메뉴 삭제 요청
  try {
    const response = await axios.delete(`${baseURL}/menu/${menuId}`, {
      headers: {
        "access-token": req.cookies.auth,
      },
    });

    const menuImageUrl = response.data.menu.menu_img;

    const countResponse = await axios.get(
      `${baseURL}/menu/count?imgUrl=${menuImageUrl}`,
      {
        headers: {
          "access-token": req.cookies.auth,
        },
      }
    );
    if (countResponse.data.count == 0) {
      const menuImage = response.data.menu.menu_img.substr(
        response.data.menu.menu_img.lastIndexOf("/") + 1
      );
      const deleteResult = await s3
        .deleteObject({
          Bucket: "wcthis",
          Key: menuImage,
        })
        .promise();
    }

    res.redirect(`/menu/show?date=${date}`);
  } catch (error) {
    res.redirect(`/?e=${error.message}`);
  }
});

module.exports = router;
