// 관리자 타입 상수
const ADMIN_TYPE = {
  FULL: 0, // 전체 권한을 가짐
  COOK: 1, // 주방 권한을 가짐
  OFFICE: 2, // 사무 권한을 가짐
};

// 관리자 회원가입 승인 상태 상수
const APPROVAL_STATUS = {
  PEND: 0, // 승인 대기 상태
  APPROVAL: 1, // 승인 상태
};

// 메뉴 이미지 저장 폴더명
const UPLOAD_PATH = 'public/images/';

const CAFETERIA_MAP = {
  1: '상록원 1층 식당(솥앤누들)',
  2: '상록원 2층 식당(백반코너)',
  3: '상록원 2층 식당(일품코너)',
  4: '상록원 2층 식당(양식코너)',
  5: '상록원 2층 식당(뚝배기코너)',
  6: '상록원 3층 식당(집밥)',
  7: '상록원 3층 식당(한그릇)',
  8: '상록원 3층 식당(채식당)',
  9: '그루터기 학생 식당',
  10: '팬앤누들',
  11: '가든쿡',
};

const BUSINESS_STATUS = {
  CLOSE: 0,
  OPEN: 1,
};

module.exports = {
  ADMIN_TYPE,
  APPROVAL_STATUS,
  UPLOAD_PATH,
  CAFETERIA_MAP,
  BUSINESS_STATUS,
};
