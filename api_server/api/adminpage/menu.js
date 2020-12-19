const express = require("express");
const { Op } = require("sequelize");
const {
  SideDish,
  sequelize,
  MainDish,
  Menu,
  MenuImage,
} = require("../../models");
const {
  isAuthenticated,
  isOfficeAdmin,
  isOffcieOrCookAdmin,
} = require("../../middlewares/auth");
const {
  convertLocalStringToDate,
  stringToDate,
  getDate,
  getMidNighOfDate,
  dateToStr,
} = require("../../utils/dateUtils");
const MenuService = require("../../service/menuService");
const {
  check,
  validationResult,
  oneOf,
  query,
  param,
  body,
} = require("express-validator");
const { ADMIN_TYPE } = require("../../utils/constants");
const fx = require("money");
fx.settings = {
  from: "KRW",
  to: "CNY",
};
fx.rates = {
  KRW: 1,
  CNY: 0.00594758,
};

const menuService = new MenuService();

const router = express.Router();

router.get("/count", isAuthenticated, async (req, res, next) => {
  let { cafeteriaId, sales_date, imgUrl } = req.query;
  try {
    if (req.user.admin_type === ADMIN_TYPE.OFFICE && imgUrl) {
      const count = await menuService.countByMenuImageUrl(imgUrl);
      return res.status(200).json({
        count: count,
      });
    } else if (cafeteriaId && req.user.admin_type === ADMIN_TYPE.OFFICE) {
      // 해당 식당 사무 관리자 이용 가능
      cafeteriaId = parseInt(cafeteriaId);
      const count = await menuService.countByCafeteriaIdAndDate(
        cafeteriaId,
        sales_date
      );
      return res.status(200).json({
        count: count,
      });
    } else if (!cafeteriaId && req.user.admin_type === ADMIN_TYPE.FULL) {
      // 총 관리자 이용 가능
      const count = await menuService.countByDate(sales_date);
      return res.status(200).json({
        count: count,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: error.message,
    });
  }
});

router.get(
  "/:menu_id",
  isAuthenticated,
  [
    param("menu_id")
      .isInt()
      .withMessage("올바른 메뉴가 아닙니다.")
      .bail()
      .toInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array(),
      });
    }
    const { menu_id } = req.params;

    try {
      const menuRecord = await Menu.findOne({
        include: [
          {
            model: SideDish,
            required: true,
          },
          {
            model: MainDish,
            required: true,
          },
        ],
        where: {
          menu_id: menu_id,
        },
      });
      const menu = {
        ...menuRecord.dataValues,
        sales_date: dateToStr(menuRecord.dataValues.sales_date),
      };
      res.status(200).json({
        ...menu,
      });
    } catch (err) {
      console.log("에러 발생 in /:menu_id");
      console.error(err);
      res.status(400).json({
        message: "메뉴 찾기 실패",
      });
    }
  }
);

router.get(
  "/",
  isAuthenticated,
  [
    query("cafeteriaId")
      .isInt()
      .withMessage("올바르지 않은 식당입니다.")
      .bail()
      .toInt(),
    query("sales_date")
      .isDate()
      .withMessage("올바르지 않은 날짜입니다.")
      .bail()
      .customSanitizer((sales_date) => {
        return convertLocalStringToDate(sales_date);
      }),
  ],
  async (req, res) => {
    let { cafeteriaId: cafeteria_id, sales_date } = req.query;

    try {
      // 1. 해당 식당의 그 날 메뉴들(메뉴명, 메뉴이미지, 포함된 반찬, 판매가능여부)를 조회한다.
      const menuRecords = await menuService.findByCafeteriaIdAndDate(
        cafeteria_id,
        sales_date
      );

      res.status(200).json({
        menuList: menuRecords,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

router.post(
  "/",
  isAuthenticated,
  isOfficeAdmin,
  [
    check("cafeteria_id")
      .isInt()
      .withMessage("올바르지 않은 식당입니다.")
      .bail()
      .toInt(),
    check("main_dish_ko")
      .trim()
      .notEmpty()
      .withMessage("반찬을 한글로 입력해주세요.")
      .bail(),
    check("main_dish_ch")
      .trim()
      .notEmpty()
      .withMessage("반찬을 중국어로 입력해주세요.")
      .bail(),
    oneOf([
      check("side_dishes_ko").isArray(),
      check("side_dishes_ko")
        .isEmpty()
        .customSanitizer((side_dish_ko) => {
          return [];
        }),
    ]),
    oneOf([
      check("side_dishes_ch").isArray(),
      check("side_dishes_ch")
        .isEmpty()
        .customSanitizer((side_dish_ch) => {
          return [];
        }),
    ]),
    check("side_dishes_ch")
      .isArray()
      .bail()
      .custom((side_dishes_ch, { req }) => {
        if (side_dishes_ch.length === req.body.side_dishes_ko.length) {
          return Promise.resolve(true);
        } else {
          return Promise.reject("반찬을 한글과 중문 모두 입력해주세요.");
        }
      })
      .bail(),
    check("menu_price")
      .isInt()
      .withMessage("가격은 숫자로 입력해주세요.")
      .bail()
      .toInt(),
    check("selling_date")
      .custom((selling_dates) => {
        if (selling_dates.length === 1 && selling_dates[0].length === 0) {
          return Promise.reject("등록 날짜를 하나 이상 선택해주세요.");
        }
        return Promise.resolve(true);
      })
      .bail()
      .customSanitizer((dates) => {
        return dates.map((date) => convertLocalStringToDate(date));
      }),
    check("classifications")
      .custom((classifications) => {
        if (classifications.length === 1 && classifications[0] === null) {
          return Promise.reject("구분을 하나 이상 선택해주세요.");
        }
        return Promise.resolve(true);
      })
      .bail()
      .isArray({ max: 2 })
      .withMessage("구분을 다시 선택해주세요.")
      .bail(),
    check("img_path").trim().isLength({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const menuDto = {
        cafeteria_id: req.body.cafeteria_id,
        main_dish_ko: req.body.main_dish_ko,
        main_dish_ch: req.body.main_dish_ch,
        side_dishes_ko: req.body.side_dishes_ko,
        side_dishes_ch: req.body.side_dishes_ch,
        price_krw: req.body.menu_price,
        price_cny: fx.convert(req.body.menu_price).toFixed(2),
        selling_date: req.body.selling_date,
        classifications: req.body.classifications,
        img_path: req.body.img_path,
      };
      const result = await menuService.registerMenu(menuDto);
      return res.status(201).json(result);
    } catch (error) {
      console.error(error);
    }
  }
);

router.delete("/:menuId", isAuthenticated, async (req, res, next) => {
  const { menuId } = req.params;
  console.log("menuId: " + menuId);
  console.log(typeof menuId);

  try {
    const menu = await menuService.findByMenuId(menuId);
    await menuService.deleteByMenuId(menuId);

    res.status(201).json({
      ...menu,
      message: "삭제 완료",
    });
  } catch (err) {
    console.error(err);

    res.status(40).json({
      message: err.message,
    });
  }
});

router.patch(
  "/",
  isAuthenticated,
  isOffcieOrCookAdmin,
  [
    body("menu_id").isInt().withMessage("올바르지 않은 메뉴입니다.").toInt(),
    body("main_dish_ko")
      .isString()
      .notEmpty()
      .withMessage("메인 메뉴명(한글)을 입력해주세요.")
      .bail(),
    body("main_dish_ch")
      .isString()
      .notEmpty()
      .withMessage("메인 메뉴명(중문)을 입력해주세요.")
      .bail(),
    oneOf(
      [
        body("side_dish_ko")
          .isString()
          .notEmpty()
          .custom((value, { req }) => {
            if (req.body.side_dish_ch.length > 1) {
              return true;
            } else {
              Promise.reject("반찬을 중문으로도 입력해야 합니다.");
            }
          }),
        body("side_dish_ko")
          .isArray()
          .custom((value, { req }) => {
            if (req.body.side_dish_ko.length === req.body.side_dish_ch.length) {
              return true;
            } else {
              Promise.reject("반찬을 한글과 중문 모두 입력해주세요.");
            }
          }),
      ],
      "반찬을 다시 입력해주세요."
    ),
    body("menu_price")
      .isInt()
      .withMessage("가격은 숫자로 입력해주세요.")
      .toInt(),
    body("selling_date")
      .isDate()
      .withMessage("날짜는 YYYY-MM-DD 형식으로 입력해주세요."),
    body("classification")
      .isIn(["점심", "저녁"])
      .withMessage("구분 선택을 다시해주세요."),
    body("sellable_status")
      .isBoolean()
      .withMessage("판매 가능 여부를 다시 선택해주세요.")
      .toBoolean(),
  ],
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({
          message: error.errors[0].msg,
        });
      }
      const menu_id = req.body.menu_id;
      const menu = {
        price_krw: req.body.menu_price,
        price_cny: fx.convert(req.body.menu_price).toFixed(2),
        sales_date: req.body.selling_date,
        classification: req.body.classification,
        sellable_status: req.body.sellable_status,
      };
      const mainDish = {
        name_ko: req.body.main_dish_ko,
        name_ch: req.body.main_dish_ch,
      };
      const sideDishes = Array.isArray(req.body.side_dish_ko)
        ? req.body.side_dish_ko.map((side_dish_ko, index) => ({
            name_ko: side_dish_ko,
            name_ch: req.body.side_dish_ch[index],
          }))
        : [{ name_ko: req.body.side_dish_ko, name_ch: req.body.side_dish_ch }];
      console.log("menu: ");
      console.dir(menu);
      console.log("mainDish: ");
      console.dir(mainDish);
      console.log("sideDishes: ");
      console.dir(sideDishes);
      const result = menuService.update(
        menu_id,
        req.user.cafeteria_id,
        menu,
        mainDish,
        sideDishes
      );
      return res.status(200).json({
        message: "메뉴 수정 완료",
      });
    } catch (error) {
      console.log("error 발생");
      return res.status(400).json({
        message: error.message,
      });
    }
    // const mainDish = {
    //   name_ko: req.body.main_dish_ko,
    //   name_ch: req.body.main_dish_ch,
    // };
    // const sideDishes =
  }
);

module.exports = router;
