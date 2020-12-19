const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const fx = require("money");
const webSocket = require("./websocket");
fx.settings = {
  from: "KRW",
  to: "CNY",
};
fx.rates = {
  KRW: 1,
  CNY: 0.00594758,
};
dotenv.config();

const { sequelize } = require("./models");

const indexRouter = require("./api");

const app = express();
app.set("port", process.env.PORT || 8005);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", indexRouter);

app.use((req, res) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  return res.json({ status: error.status, message: error.message });
});

const server = app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});

webSocket(server, app);
