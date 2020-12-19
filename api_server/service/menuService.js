const Menu = require("../models/menu");
const MainDish = require("../models/mainDish");
const SideDish = require("../models/sideDish");
const Cafeteria = require("../models/cafeteria");
const { Op } = require("sequelize");
const { convertLocalStringToDate } = require("../utils/dateUtils");
const { sequelize } = require("../models");

class MenuService {
  constructor() {
    this.MenuRepository = Menu;
    this.CafeteriaRepositry = Cafeteria;
    this.MainDishRepository = MainDish;
    this.SideDishRepository = SideDish;
  }

  async registerMenu(menuDto) {
    const {
      cafeteria_id,
      main_dish_ko, // 메인 음식 이름
      main_dish_ch,
      side_dishes_ko,
      side_dishes_ch,
      price_krw,
      price_cny,
      selling_date: selling_dates,
      classifications,
      img_path,
    } = menuDto;
    try {
      // 1. 메인 음식 저장하기
      const [
        mainDishRecord,
        isCreated,
      ] = await this.MainDishRepository.findOrCreate({
        where: {
          name_ko: main_dish_ko,
          cafeteria_id: cafeteria_id,
        },
        defaults: {
          name_ch: main_dish_ch,
        },
      });

      // 2. 메뉴 저장하기
      const menuRecords = [];
      for (let selling_date of selling_dates) {
        for (let classification of classifications) {
          const menuRecord = await this.MenuRepository.create({
            time_classification: classification,
            sales_date: selling_date,
            price_krw: price_krw,
            price_cny: price_cny,
            sellable_status: true,
            cafeteria_id: cafeteria_id,
            menu_img: img_path,
          });
          menuRecords.push(menuRecord);
        }
      }

      // 3. 생성한 메뉴마다 메인 음식의 FK를 설정해준다.
      menuRecords.forEach(async (menuRecord) => {
        await menuRecord.setMainDish(mainDishRecord);
      });

      if (side_dishes_ko.length !== 0) {
        // 4. 반찬 저장하기
        const sideDishRecords = await Promise.all(
          side_dishes_ko.map(async (side_dish_ko, index) => {
            const [
              sideDishRecord,
              isCreated,
            ] = await this.SideDishRepository.findOrCreate({
              where: {
                name_ko: side_dish_ko,
              },
              defaults: {
                name_ch: side_dishes_ch[index],
              },
            });
            return sideDishRecord;
          })
        );

        // 5. 메뉴에 포함된 반찬 저장하기
        menuRecords.forEach(async (menuRecord) => {
          await menuRecord.setSideDishes(sideDishRecords);
        });
      }

      return menuRecords;
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async countByMenuImageUrl(menuImageUrl) {
    try {
      const count = await this.MenuRepository.count({
        where: {
          menu_img: menuImageUrl,
        },
      });
      return count;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update(menu_id, cafeteria_id, menu, mainDish, sideDishes) {
    try {
      const result = await sequelize.transaction(async (t) => {
        await this.MenuRepository.update(
          { ...menu },
          {
            where: {
              menu_id: menu_id,
            },
            transaction: t,
          }
        );

        const [
          mainDishResult,
          isCreated,
        ] = await this.MainDishRepository.findOrCreate({
          where: {
            name_ko: mainDish.name_ko,
          },
          defaults: {
            name_ch: mainDish.name_ch,
            cafeteria_id: cafeteria_id,
          },
          transaction: t,
        });

        await sequelize.query(
          `
        UPDATE menu SET main_dish_id = ${mainDishResult.dataValues.id} WHERE menu_id = ${menu_id}
        `,
          { transaction: t }
        );

        const sideDishesResult = await Promise.all(
          sideDishes.map(async (sideDish) => {
            let sideDishResult = await this.SideDishRepository.findOne({
              where: {
                name_ko: sideDish.name_ko,
              },
              transaction: t,
            });
            if (sideDishResult) {
              await this.SideDishRepository.update(
                {
                  name_ch: sideDish.name_ch,
                },
                {
                  where: {
                    name_ko: sideDish.name_ko,
                  },
                  transaction: t,
                }
              );
            } else {
              sideDishResult = await this.SideDishRepository.create(
                {
                  name_ko: sideDish.name_ko,
                  name_ch: sideDish.name_ch,
                },
                {
                  transaction: t,
                }
              );
            }
            return sideDishResult;
          })
        );

        await sequelize.query(
          `
        DELETE FROM menu_side_dish WHERE menu_id = ${menu_id}
        `,
          { transaction: t }
        );

        const menuSideDishResult = await Promise.all(
          sideDishesResult.map((sideDish) => {
            return new Promise(async function (resolve, reject) {
              try {
                await sequelize.query(
                  `
              INSERT INTO menu_side_dish(side_dish_id, menu_id) VALUES(${sideDish.dataValues.id}, ${menu_id})
              `,
                  { transaction: t }
                );
                resolve({
                  side_dish_id: sideDish.dataValues.id,
                  menu_id: menu_id,
                });
              } catch (error) {
                reject(new Error(error.message));
              }
            });
          })
        );
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new Error("메뉴 업데이트에 실패했습니다.");
    }
  }

  async findByMenuId(menu_id) {
    try {
      const record = await this.MenuRepository.findByPk(menu_id, {
        include: [
          {
            model: MainDish,
            required: true,
          },
          {
            model: SideDish,
          },
          {
            model: Cafeteria,
            attributes: [
              "cafeteria_id",
              "cafeteria_name_ko",
              "cafeteria_name_ch",
            ],
            required: true,
          },
        ],
      });
      if (record) {
        return { menu: record.dataValues };
      } else {
        throw new Error("Menu is Not Found.");
      }
    } catch (error) {
      console.log("에러 발생: ");
      console.error(error);
    }
  }

  async deleteByMenuId(menu_id) {
    try {
      await this.MenuRepository.destroy({
        where: {
          menu_id: menu_id,
        },
      });
    } catch (error) {
      throw new Error("Menu is Not Found.");
    }
  }

  async countByCafeteriaIdAndDate(cafeteria_id, date) {
    try {
      const count = await this.MenuRepository.count({
        where: {
          cafeteria_id: cafeteria_id,
          sales_date: convertLocalStringToDate(date),
        },
      });
      console.log("count: " + count);
      return count;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async countByDate(date) {
    try {
      const count = await this.MenuRepository.count({
        where: {
          sales_date: convertLocalStringToDate(date),
        },
      });
      return count;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async findByCafeteriaIdAndDate(cafeteria_id, sales_date) {
    console.log("findMenusByCafeteriaIdAndDate 진입");
    try {
      const records = await this.MenuRepository.findAll({
        where: {
          cafeteria_id: cafeteria_id,
          sales_date: sales_date,
        },
        include: [
          {
            model: SideDish,
            attributes: ["id", "name_ko", "name_ch"],
            required: false,
          },
          {
            model: MainDish,
            attributes: ["id", "name_ko", "name_ch"],
            required: true,
          },
        ],
        order: [["time_classification", "DESC"]],
      });
      if (records) {
        return records;
      } else {
        throw new Error("Menus are Not Found");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async countOfMenus(where) {
    try {
      const row = await this.MenuRepository.findOne({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("menu_id")), "cnt_of_menus"],
        ],
        where: where,
      });
      return {
        count_of_menus: row.dataValues.cnt_of_menus,
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async findAllMenus() {
    const records = await this.MenuRepository.findAll();
    if (records) {
      return {
        menuList: records,
      };
    } else {
      throw new Error("reegistered menus are Not Found");
    }
  }

  async findByCafeteriaNameStartingWithAndSalesDateAndTimeClassification(
    cafeteriaName,
    date,
    time_classification
  ) {
    const records = await this.CafeteriaRepositry.findAll({
      where: {
        name_ko: {
          [Op.like]: `${cafeteriaName}%`,
        },
      },
      include: [
        {
          model: Menu,
          required: false,
          where: {
            sales_date: date,
            time_classification: time_classification,
            sellable_status: true,
          },
          include: [
            {
              model: MainDish,
              required: true,
            },
            {
              model: SideDish,
            },
          ],
        },
      ],
    });

    if (records) {
      return records;
    } else {
      throw new Error("Menus are not found");
    }
  }

  async findBySalesDateAndTimeClassification(date, time_classification) {
    const records = await this.CafeteriaRepositry.findAll({
      include: [
        {
          model: Menu,
          required: false,
          where: {
            sales_date: convertLocalStringToDate(date),
            time_classification: time_classification,
            sellable_status: true,
          },
          include: [
            {
              model: MainDish,
            },
            {
              model: SideDish,
            },
          ],
        },
      ],
      order: [[Menu, "menu_id", "DESC"]],
    });

    if (records) {
      return records;
    } else {
      throw new Error("Menus are not found");
    }
  }
}

module.exports = MenuService;
