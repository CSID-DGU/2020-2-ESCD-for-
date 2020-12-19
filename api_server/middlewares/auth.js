const jwt = require('jsonwebtoken');
const { APPROVAL_STATUS, ADMIN_TYPE } = require('../utils/constants');

const isAuthenticated = async (req, res, next) => {
  const { 'access-token': receivedToken } = req.headers;
  try {
    const decryptedToken = await jwt.verify(
      receivedToken,
      process.env.JWT_SECRET
    );

    if (decryptedToken) {
      req.user = {
        admin_id: decryptedToken.admin_id,
        admin_type: decryptedToken.admin_type,
        approval_status: decryptedToken.approval_status,
        cafeteria_id: decryptedToken.cafeteria_id,
      };
      console.log('isAuthenticated next()');
      next();
    } else {
      throw new Error('올바르지 않은 토큰입니다.');
    }
  } catch (err) {
    return res.status(401).json({
      isAuthorized: false,
      message: err.message,
    });
  }
};

const isApproved = (req, res, next) => {
  if (req.user.approval_status == APPROVAL_STATUS.APPROVAL) {
    next();
  } else {
    return res.status(401).json({
      message: '승인되지 않은 관리자입니다.',
    });
  }
};

const isOfficeAdmin = (req, res, next) => {
  if (req.user.admin_type === ADMIN_TYPE.OFFICE) {
    next();
  } else {
    return res.status(401).json({
      message: '사무 관리자 권한이 없습니다.',
    });
  }
};

const isOfficeOrFullAdmin = (req, res, next) => {
  if (
    req.user.admin_type === ADMIN_TYPE.OFFICE ||
    req.user.admin_type === ADMIN_TYPE.FULL
  ) {
    next();
  } else {
    return res.status(401).json({
      message: '해당 관리자는 사무 관리자 또는 총 관리자가 아닙니다.',
    });
  }
};

const isCookAdmin = (req, res, next) => {
  if (req.user.admin_type === ADMIN_TYPE.COOK) {
    next();
  } else {
    return res.status(401).json({
      message: '주방 관리자 권한이 없습니다.',
    });
  }
};

const isOffcieOrCookAdmin = (req, res, next) => {
  const admin_type = req.user.admin_type;
  console.log('admin_type: ' + admin_type);
  if (admin_type === ADMIN_TYPE.OFFICE || admin_type === ADMIN_TYPE.COOK) {
    next();
  } else {
    return res.status(401).json({
      message: '관리자 권한이 없습니다.',
    });
  }
};

const isFullAdmin = (req, res, next) => {
  console.log('isFullAdmin 진입');
  if (req.user.admin_type === ADMIN_TYPE.FULL) {
    console.log('full admin');
    next();
  } else {
    return res.status(401).json({
      message: '총 관리자 권한이 없습니다.',
    });
  }
};

module.exports = {
  isAuthenticated,
  isApproved,
  isOfficeAdmin,
  isCookAdmin,
  isFullAdmin,
  isOffcieOrCookAdmin,
  isOfficeOrFullAdmin,
};
