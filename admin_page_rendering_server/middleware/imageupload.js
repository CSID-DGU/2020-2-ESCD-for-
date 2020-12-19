const path = require("path");
const { UPLOAD_PATH } = require("../utils/constants");

const fileExtensionFilter = (req, file, done) => {
  console.log("file extension filter: ");
  console.dir(file);
  if (file.mimetype.startsWith("image")) {
    done(null, true);
  } else {
    done("사진 파일만 업로드 가능합니다", false);
  }
};


module.exports = {
  fileExtensionFilter,
};
