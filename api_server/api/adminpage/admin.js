const express = require("express");
const router = express.Router();
const { encryptPassword, verifyPassword } = require("../../utils/bcryptUtils");
const { Admin } = require("../../models");
const AdminService = require("../../service/adminService");
const CafeteriaService = require("../../service/cafeteriaService");
const { ADMIN_TYPE } = require("../../utils/constants");
const { check, validationResult } = require("express-validator");
const {
  isAuthenticated,
  isApproved,
  isFullAdmin,
  isOfficeOrFullAdmin,
} = require("../../middlewares/auth");
const Cafeteria = require("../../models/cafeteria");
const { dateToStr, dateTimeToStr } = require("../../utils/dateUtils");

const cafeteriaService = new CafeteriaService();
const adminService = new AdminService();

router.get("/count", isAuthenticated, isFullAdmin, async (req, res, next) => {
  console.log("/admin/count 진입");
  console.dir(req.query);
  try {
    const notApprovedCount = await adminService.countNotApproved();
    const totalCount = await adminService.countAll();
    return res.status(200).json({
      notApprovedCount: notApprovedCount,
      totalCount: totalCount,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
});
/*
 * 특정 id를 가진 관리자를 반환한다.
 * 해당 기능은 회원 가입 시 이미 가입되어 있는 회원인지를 확인하는데 사용한다.
 */
router.get("/:id", async (req, res, next) => {
  if (req.params.id) {
    const { id } = req.params;
    try {
      const adminResult = await adminService.findByAdminId(id);

      return res.status(200).json({
        isExisted: true,
        admin: {
          ...adminResult.admin,
          created_at: dateTimeToStr(adminResult.admin.created_at),
        },
        cafeteria: adminResult.Cafeterium,
      });
    } catch (err) {
      return res.status(200).json({
        isExisted: false,
        message: err.message,
      });
    }
  }
  next();
});

/*
 * 전체 관리자 목록을 반환한다.
 * 해당 기능은 총 관리자에게만 허용된다.
 */
router.get("/", isAuthenticated, isFullAdmin, async (req, res) => {
  try {
    console.log("GET /admin 진입");
    const result = await adminService.findAllAdmins();

    res.status(200).json({
      adminList: result,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

/*
 * 회원가입을 요청한다.
 * 해당 기능은 모든 사용자에게 허용되며, 총 관리자가 승인을 한 뒤, 관리자 페이지를
 * 이용할 수 있다. (최초 가입 시, approval_status == 0)
 */
router.post(
  "/",
  [
    check("id")
      .trim()
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("아이디를 입력해주세요")
      .bail()
      .custom(async (value, { req }) => {
        try {
          const adminResult = await adminService.findByAdminId(value);
          if (adminResult) {
            return Promise.reject("해당 아이디는 이미 존재하는 아이디입니다.");
          }
        } catch (error) {
          return Promise.resolve(true);
        }
      })
      .bail(),
    check("password")
      .trim()
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage("비밀번호를 입력해주세요.")
      .bail(),
    check("cafeteriaId")
      .isInt()
      .withMessage("올바르지 않은 주방입니다.")
      .bail()
      .toInt()
      .custom(async (value, { req }) => {
        try {
          const cafeteriaResult = await cafeteriaService.findByCafeteriaId(
            value
          );
          return Promise.resolve(true);
        } catch (error) {
          return Promise.reject("해당 식당은 존재하지 않는 식당입니다.");
        }
      }),
    check("adminType")
      .isInt()
      .withMessage("올바르지 않은 관리자 유형입니다.")
      .bail()
      .toInt()
      .isIn([0, 1, 2])
      .withMessage("올바르지 않은 관리자 유형입니다."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: errors.array(),
        });
      }
      console.dir(req.body);
      const { id, password, cafeteriaId, adminType } = req.body;

      // 1. 가입되어 있지 않다면 해싱하여 DB에 insert하고, 201 상태 코드를 반환
      const result = await adminService.create(
        id,
        password,
        adminType,
        cafeteriaId
      );

      res.status(201).json({
        message: "회원가입 완료",
        result,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
  }
);

// 관리자 정보를 수정한다.
router.patch("/", isAuthenticated, isOfficeOrFullAdmin, async (req, res) => {
  console.dir(req.body);
  const { adminId: id, password, requestApproval, requestModify } = req.body;
  try {
    if (requestApproval) {
      const newAdminResult = await Admin.update(
        {
          approval_status: true,
        },
        {
          where: {
            admin_id: id,
          },
        }
      );
      return res.status(200).json({
        message: "가입 승인 완료",
      });
    } else if (requestModify) {
      // 2. 해당 비밀번호를 수정한다.
      const result = await adminService.updatePassword(id, password);

      // 변경된 관리자 정보를 반환한다.
      return res.status(200).json({
        ...result,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
});

router.delete("/", isAuthenticated, isFullAdmin, async (req, res, next) => {
  const { adminId } = req.body;

  try {
    await Admin.destroy({
      where: {
        admin_id: adminId,
      },
    });

    res.status(200).json({
      message: "해당 회원 탈퇴 완료",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = router;
