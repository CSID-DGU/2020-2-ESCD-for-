const { Sales, Cafeteria } = require('../models');

class SalesService {
  constructor() {
    this.salesRepository = Sales;
  }

  async findByDate(date) {
    try {
      console.dir(date);
      const { count, rows } = await this.salesRepository.findAndCountAll({
        where: {
          order_date: date,
        },
        include: [
          {
            model: Cafeteria,
          },
        ],
      });
      return {
        count: count,
        rows: rows,
      };
    } catch (error) {
      throw new Error('매출 가져오기 에러 발생');
    }
  }
}

module.exports = SalesService;
