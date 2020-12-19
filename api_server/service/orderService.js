const Order = require("../models/order");
const { Menu, Cafeteria, OrderDetail, sequelize, Sales } = require("../models");
const { Op } = require("sequelize");
const {
  convertLocalStringToDate,
  getDate,
  getMidNighOfDate,
} = require("../utils/dateUtils");

class OrderService {
  constructor() {
    this.orderRepository = Order;
    this.menuRepository = Menu;
    this.orderDetailRepository = OrderDetail;
    this.salesRepository = Sales;
  }

  async updateIsRecivedByOrderNumber(orderNumber) {
    try {
      const transactionResult = await sequelize.transaction(async (t) => {
        const updatedCount = await this.orderRepository.update(
          {
            is_received: true,
          },
          {
            where: {
              order_number: orderNumber,
            },
            transaction: t,
          }
        );
        if (updatedCount[0] === 1) {
          // 주문 완료 처리 성공 시 매출액 업데이트
          // 1. 해당 주문 번호에 결제된 금액을 구함
          const salesAmount = await sequelize.query(
            `
          SELECT o.order_number, SUM(m.price_krw) amount, MIN(o.cafeteria_id) cafeteriaId
            FROM ${"`order` o"}, order_detail od, menu m
           WHERE o.order_number = ${orderNumber}
             AND o.order_number = od.order_number
             AND od.menu_id = m.menu_id
          GROUP BY o.order_number;
          `,
            { transaction: t }
          );

          //2. 결제된 금액을 매출 테이블에 업데이트
          const totalAmount = parseInt(salesAmount[0][0].amount);

          const salesResult = await this.salesRepository.findOne({
            where: {
              cafeteria_id: salesAmount[0][0].cafeteriaId,
              order_date: getMidNighOfDate(),
            },
            transaction: t,
          });

          if (salesResult) {
            await this.salesRepository.update(
              {
                sales: salesResult.dataValues.sales + totalAmount,
              },
              {
                where: {
                  cafeteria_id: salesAmount[0][0].cafeteriaId,
                  order_date: getMidNighOfDate(),
                },
                transaction: t,
              }
            );
          } else {
            await this.salesRepository.create(
              {
                sales: totalAmount,
                cafeteria_id: salesAmount[0][0].cafeteriaId,
                order_date: getMidNighOfDate(),
              },
              { transaction: t }
            );
          }
        } else {
          throw new Error("주문 완료 처리 실패");
        }
      });
      return "주문 완료 처리 성공";
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async checkByOrderNumberAndOpenId(orderNumber, openId) {
    try {
      const row = await sequelize.query(`
      SELECT order_number
        FROM ${"`order` o"}
       WHERE o.order_number = ${orderNumber} AND o.order_user_id = '${openId}';
      `);
      if (row) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findByOrderNumber(orderNumber) {
    try {
      const rows = await sequelize.query(`
      SELECT *
        FROM ${"`order` o"}, order_detail od, menu m, main_dish md, cafeteria c
       WHERE o.order_number = ${orderNumber}
         AND o.order_number = od.order_number
         AND od.menu_id = m.menu_id
         AND m.main_dish_id = md.id
         AND m.cafeteria_id = c.cafeteria_id;
      `);
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findByOpenId(openid) {
    try {
      const rows = await sequelize.query(`
      SELECT o.order_number, o.meal_ticket_number, o.order_date, o.is_received, o.order_user_id, od.quantity, o.cafeteria_id, c.cafeteria_name_ko, c.cafeteria_name_ch,
             m.price_krw, m.price_cny, m.menu_img, md.name_ko, md.name_ch
        FROM ${"`order` o"}, order_detail od, cafeteria c, menu m, main_dish md
       WHERE o.order_user_id = '${openid}'
         AND o.order_number = od.order_number
         AND o.cafeteria_id = c.cafeteria_id
         AND od.menu_id = m.menu_id
         AND m.main_dish_id = md.id
       ORDER BY o.order_date DESC, o.is_received ASC;
      `);
      return rows[0];
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async nextMealTicketNumber(cafeteriaId) {
    try {
      const row = await this.orderRepository.findOne({
        attributes: ["meal_ticket_number"],
        where: {
          order_date: {
            [Op.between]: [getMidNighOfDate(), getDate()],
          },
          cafeteria_id: cafeteriaId,
        },
        order: [["meal_ticket_number", "DESC"]],
      });
      if (row) {
        return row.dataValues.meal_ticket_number + 1;
      } else {
        return 1;
      }
    } catch (error) {
      console.error(error);
      throw new Error("식권 발급 중 에러 발생");
    }
  }

  async order(cafeteriaId, ticketNumber, orderDate, open_user_id, orderList) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const orderResult = await this.orderRepository.create(
          {
            meal_ticket_number: ticketNumber,
            order_date: orderDate,
            order_user_id: open_user_id,
            cafeteria_id: cafeteriaId,
          },
          { transaction: t }
        );

        const orderDetailResult = await Promise.all(
          orderList.map(async (orderItem) => {
            return await this.orderDetailRepository.create(
              {
                order_number: orderResult.dataValues.order_number,
                quantity: orderItem.quantity,
                menu_id: orderItem.menu_id,
              },
              { transaction: t }
            );
          })
        );

        return orderResult;
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new Error("주문 처리 중 에러 발생");
    }
  }

  async findNotReceivedOrderByCafeteriaIdAndOrderDate(cafeteriaId, orderDate) {
    try {
      const rows = await sequelize.query(`
      SELECT o.order_number, o.meal_ticket_number, o.order_date, o.is_received, o.order_user_id, o.cafeteria_id, od.quantity, od.menu_id, m.time_classification, m.sales_date, m.price_krw, m.price_cny, md.id, md.name_ko, md.name_ch
        FROM ${"`order`"} o, order_detail od, menu m, main_dish md
       WHERE o.order_number = od.order_number
         AND od.menu_id = m.menu_id
         AND m.main_dish_id = md.id
         AND m.cafeteria_id = ${cafeteriaId}
         AND o.order_date BETWEEN '${orderDate} 00:00:00' AND '${orderDate} 23:59:59'
         AND o.is_received = 0;
      `);

      // console.dir(rows);
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findOrderListByCafeteriIdAndTicketNumberAndOrderDateTime(
    cafeteriaId,
    ticketNumber,
    orderDateTime
  ) {
    try {
      const rows = await sequelize.query(`
      SELECT o.meal_ticket_number, o.order_date, od.quantity, m.price_krw, m.price_cny, m.menu_img, md.name_ko, md.name_ch
        FROM ${"`order` o"}, order_detail od, menu m, main_dish md
       WHERE o.meal_ticket_number = ${ticketNumber}
         AND o.order_date = '${orderDateTime}'
         AND o.cafeteria_id = ${cafeteriaId}
         AND o.order_number = od.order_number
         AND od.menu_id = m.menu_id
         AND m.main_dish_id = md.id;
      `);
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async cancelByOrderNumber(orderNumber) {
    try {
      const row = await sequelize.query(`
      UPDATE ${"`order`"} SET is_received = -1 WHERE order_number = ${orderNumber}
      `);
      return row;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = OrderService;
