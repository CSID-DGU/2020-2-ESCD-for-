const Cafeteria = require("../models/cafeteria");
const { sequelize, Sales } = require("../models");
const {
  createIntervalDatesSalesObject,
  dateToStr,
} = require("../utils/dateUtils");

class CafeteriaService {
  constructor() {
    this.CafeteriaRepository = Cafeteria;
    this.SalesRepository = Sales;
  }

  async deleteByCafeteriumId(id) {
    try {
      const result = await this.CafeteriaRepository.destroy({
        where: {
          cafeteria_id: id,
        },
      });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async create(name_ko, name_ch, location) {
    try {
      const [
        cafeteria,
        isCreated,
      ] = await this.CafeteriaRepository.findOrCreate({
        where: {
          name_ko: name_ko,
        },
        defaults: {
          name_ch: name_ch,
          location: location,
          business_status: true,
        },
      });
      return [cafeteria, isCreated];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findByOffsetAndLimit(offset, limit) {
    const rows = await this.CafeteriaRepository.findAll({
      offset: offset,
      limit: limit,
    });
    if (rows) {
      return rows;
    } else {
      return [];
    }
  }

  async findAll() {
    const rows = await this.CafeteriaRepository.findAll();
    if (rows) {
      return rows;
    } else {
      return [];
    }
  }

  async findAllCafeteriaName() {
    try {
      const rows = await this.CafeteriaRepository.findAll({
        attributes: ["cafeteria_id", "name_ko", "name_ch"],
      });

      return rows;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findByCafeteriaId(cafeteria_id) {
    const row = await this.CafeteriaRepository.findByPk(cafeteria_id);
    if (row) {
      return { cafeteria: row.dataValues };
    } else {
      throw new Error("Cafeterium is Not Found");
    }
  }

  async countAll() {
    try {
      const count = await this.CafeteriaRepository.count();

      return count;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAndCountAllCafeteria(where) {
    const { count, rows } = await this.CafeteriaRepository.findAndCountAll({
      where: where,
    });
    if (count) {
      return {
        count: count,
        cafeteriaList: rows,
      };
    } else {
      throw new Error("reegistered cafeteria are Not Found");
    }
  }

  async update(data, where) {
    try {
      await this.CafeteriaRepository.update(data, { where: where });
      return true;
    } catch (error) {
      throw new Error("식당 업데이트 실패");
    }
  }

  async findCafeteriaAndSalesByDate(date) {
    try {
      console.log("date: " + date);
      const rows = await sequelize.query(`
      SELECT c.cafeteria_id, c.cafeteria_name_ko, c.cafeteria_name_ch, c.business_status, c.location, IFNULL((SELECT sales FROM sales s WHERE c.cafeteria_id = s.cafeteria_id AND s.order_date = '${date}'), 0) sales, '${date}' order_date
        FROM cafeteria c;
      `);
      return {
        count: rows[0].length,
        rows: rows[0],
      };
    } catch (error) {
      console.log("error: ");
      console.error(error);
      throw new Error("학생 식당의 매출 데이터 조회 실패");
    }
  }

  async findMenuAndSalesByDateAndCafeteriaId(cafeteriaId, date) {
    try {
      const rows = await sequelize.query(`
      SELECT l.menu_id, l.name_ko, l.name_ch, l.cafeteria_id, l.time_classification, l.sales_date, l.price_krw, l.price_cny, IFNULL(r.quantity, 0) quantity, IFNULL((l.price_krw * r.quantity), 0) amount
        FROM (SELECT m.menu_id, m.time_classification, m.sales_date, m.price_krw, m.price_cny, m.sellable_status, md.*
		            FROM menu m, main_dish md 
		           WHERE m.cafeteria_id = ${cafeteriaId}
		             AND m.main_dish_id = md.id 
		             AND m.sales_date BETWEEN '${date} 00:00:00' AND '${date} 23:59:59') l
      LEFT OUTER JOIN (SELECT od.menu_id, SUM(quantity) quantity
				                 FROM ${"`order` o"}, order_detail od
                        WHERE o.cafeteria_id = ${cafeteriaId}
                          AND o.is_received = 1
					                AND o.order_number = od.order_number
					                AND o.order_date BETWEEN '${date} 00:00:00' AND '${date} 23:59:59'
				              GROUP BY od.menu_id) r
      ON l.menu_id = r.menu_id;
      `);

      return rows[0];
    } catch (error) {
      console.error(error);
      throw new Error("해당 식당의 메뉴 별 매출액 조회 실패");
    }
  }

  async findSumOfAmountByDateAndCafeteriaId(cafeteriaId, date) {
    try {
      const rows = await sequelize.query(`
      SELECT SUM(amount) amount
        FROM (SELECT quantity, price_krw, quantity * price_krw amount
		            FROM ${"`order`"} o, order_detail od, menu m
		           WHERE o.order_date BETWEEN '${date} 00:00:00' AND '${date} 23:59:59'
                 AND o.cafeteria_id = ${cafeteriaId}
                 AND o.is_received = 1
		             AND o.order_number = od.order_number
		             AND od.menu_id = m.menu_id) r;
      `);
      return rows[0];
    } catch (error) {
      console.error(error);
      throw new Error(`해당 식당의 ${date} 날짜의 총 매출액 조회 실패`);
    }
  }

  async findSalesByCafeteriaIdAndIntervalDate(
    cafeteriaId,
    start_date,
    end_date
  ) {
    try {
      const rows = await sequelize.query(`
      SELECT c.cafeteria_id, c.cafeteria_name_ko, c.cafeteria_name_ch, s.order_date, s.sales
        FROM cafeteria c, sales s
       WHERE c.cafeteria_id = ${cafeteriaId}
         AND c.cafeteria_id = s.cafeteria_id
         AND s.order_date BETWEEN '${start_date} 00:00:00' AND '${end_date} 23:59:59';
      `);
      const result = createIntervalDatesSalesObject(start_date, end_date);
      rows[0].forEach((element) => {
        result[dateToStr(element.order_date)] = element.sales;
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new Error("해당 식당의 특정 기간의 매출액 조회 실패");
    }
  }

  async findSalesOfCafeteriaByStartDateAndEndDate(start_date, end_date) {
    try {
      const rows = await sequelize.query(`
      SELECT *
        FROM sales
       WHERE order_date BETWEEN '${start_date} 00:00:00' AND '${end_date} 00:00:00';
      `);

      let cafeteria = await (await this.findAll()).map((cafeterium) => ({
        cafeteria_id: cafeterium.cafeteria_id,
        name_ko: cafeterium.name_ko,
        name_ch: cafeterium.name_ch,
      }));
      cafeteria = cafeteria.map((cf) => ({ ...cf, sales: 0 }));

      const intervalDateObj = createIntervalDatesSalesObject(
        start_date,
        end_date
      );
      Object.keys(intervalDateObj).forEach((dateStr) => {
        intervalDateObj[dateStr] = [...cafeteria];
      });
      rows[0].forEach((row) => {
        const date = dateToStr(row.order_date);
        intervalDateObj[date][row.cafeteria_id - 1] = {
          ...intervalDateObj[date][row.cafeteria_id - 1],
          sales: row.sales,
        };
      });
      console.dir(intervalDateObj);
      return intervalDateObj;
    } catch (error) {
      console.error(error);
      throw new Error("특정 기간의 식당들의 매출액 조회 실패");
    }
  }
}

module.exports = CafeteriaService;
