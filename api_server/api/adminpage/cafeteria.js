const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  isFullAdmin,
  isOfficeAdmin,
  isOfficeOrFullAdmin,
} = require("../../middlewares/auth");
const { ADMIN_TYPE } = require("../../utils/constants");
const { Cafeteria, sequelize } = require("../../models/");
const {
  param,
  query,
  body,
  check,
  validationResult,
} = require("express-validator");

const CafeteriaService = require("../../service/cafeteriaService");
const cafeteriaService = new CafeteriaService();

router.get("/name", async (req, res) => {
  try {
    const cafeteria = await cafeteriaService.findAllCafeteriaName();
    return res.status(200).json(cafeteria);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/count", isAuthenticated, isFullAdmin, async (req, res) => {
  try {
    const totalCount = await cafeteriaService.countAll();

    res.status(200).json({
      count: totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
});

router.get(
  "/:id",
  isAuthenticated,
  [param("id").isInt().bail().toInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    let { id } = req.params;
    // 권한이 있을 경우
    if (
      req.user.admin_type === ADMIN_TYPE.FULL || // 총 관리자이거나
      req.user.cafeteria_id === id // 해당 식당의 관리자이면
    ) {
      try {
        const cafeteriaResult = await Cafeteria.findByPk(id);

        if (!cafeteriaResult) {
          return res.status(200).json({
            message: "등록된 식당이 아닙니다.",
          });
        }
        // 해당 식당 정보가 있을 시
        return res.status(200).json({
          ...cafeteriaResult.dataValues,
        });
      } catch (err) {
        return res.status(400).json({
          message: "해당 식당 정보가 존재하지 않습니다.",
        });
      }
    } else {
      return res.status(401).json({
        message: "허가되지 않은 권한입니다.",
      });
    }
  }
);

// 전체 식당 목록을 반환
router.get(
  "/",
  [
    query("offset").isInt().withMessage("Please pass the offset query").toInt(),
    query("limit").isInt().withMessage("Please pass the limit query").toInt(),
  ],
  async (req, res) => {
    try {
      const result = await cafeteriaService.findByOffsetAndLimit(
        req.query.offset * req.query.limit,
        req.query.limit
      );

      // 모든 식당을 배열 형태로 반환
      res.status(200).json({
        offset: req.query.offset,
        limit: req.query.limit,
        cafeteriaList: result,
      });
    } catch (err) {
      return res.status(400).json({
        message: err.message,
      });
    }
  }
);

// 새로운 식당 추가
router.post("/", async (req, res) => {
  const { name_ko, name_ch, location } = req.body;
  console.log("새로운 식당 추가 시작: ");
  console.dir(req.body);
  try {
    const [cafeteria, isCreated] = await cafeteriaService.create(
      name_ko,
      name_ch,
      location
    );

    res.status(201).json({
      isCreated: isCreated,
      cafeteria: cafeteria,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.put(
  "/:cafeteria_id",
  isAuthenticated,
  isOfficeOrFullAdmin,
  [
    param("cafeteria_id")
      .isInt()
      .withMessage("올바르지 않은 식당입니다.")
      .toInt(),
    body("name_ko")
      .isString()
      .notEmpty()
      .withMessage("변경할 식당명을 한글로 입력해주세요.")
      .bail(),
    body("name_ch")
      .isString()
      .notEmpty()
      .withMessage("변경할 식당명을 중문으로 입력해주세요.")
      .bail(),
    body("business_status")
      .isBoolean()
      .withMessage("영업 상태를 설정해주세요.")
      .bail(),
    body("location")
      .isString()
      .notEmpty()
      .withMessage("변경할 위치를 입력해주세요.")
      .bail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }
      console.dir(req.params);
      console.dir(req.body);
      const result = cafeteriaService.update(req.body, {
        cafeteria_id: req.params.cafeteria_id,
      });
      if (result) {
        return res.status(200).json({
          message: "수정 완료했습니다.",
        });
      } else {
        throw new Error("수정 실패했습니다.");
      }
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
);

router.patch(
  "/",
  isAuthenticated,
  isOfficeAdmin,
  [
    check("where.cafeteria_id")
      .isInt()
      .withMessage("올바르지 않은 식당입니다.")
      .bail()
      .toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: errors.array(),
        });
      }
      console.log("PATCH /cafeteria 진입");
      console.dir(req.body);
      const result = await cafeteriaService.update(
        req.body.data,
        req.body.where
      );
      console.log("변경 완료: " + result);
      if (result) {
        res.status(201).json({
          isUpdated: true,
        });
      }
    } catch (err) {
      console.log("PATCH /cafeteria에서 에러 발생");
      console.error(err);
      return res.status(400).json({
        message: err.message,
      });
    }
  }
);

router.delete(
  "/",
  isAuthenticated,
  isFullAdmin,
  body("cafeterium_id")
    .isInt()
    .withMessage("Please pass the cafeterium id")
    .toInt(),
  async (req, res) => {
    try {
      const result = await cafeteriaService.deleteByCafeteriumId(
        req.body.cafeterium_id
      );
      if (result === 1) {
        res.status(200).json({
          message: "삭제완료",
        });
      }
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;
