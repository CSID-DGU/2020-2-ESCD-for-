const Admin = require('../models/admin');
const { encryptPassword, verifyPassword } = require('../utils/bcryptUtils');
const { sequelize, Cafeteria } = require('../models');

class AdminService {
  constructor() {
    this.AdminRepository = Admin;
  }

  async updatePassword(admin_id, password) {
    try {
      const hashedPassword = await encryptPassword(password);
      const updatedCnt = await this.AdminRepository.update(
        {
          password: hashedPassword,
        },
        {
          where: {
            admin_id: admin_id,
          },
        }
      );
      console.dir(updatedCnt);
      return updatedCnt[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async create(admin_id, password, admin_type, cafeteria_id) {
    try {
      const hashedPassword = await encryptPassword(password);

      const row = await this.AdminRepository.create({
        admin_id: admin_id,
        password: hashedPassword,
        admin_type: admin_type,
        approval_status: cafeteria_id ? 0 : 1, // cafeteriaId가 없다는 것은 총 관리자임을 뜻함.
        cafeteria_id: cafeteria_id,
      });

      return row;
    } catch (error) {
      throw new Error('회원가입에 실패했습니다.');
    }
  }

  async findByAdminId(admin_id) {
    const row = await this.AdminRepository.findByPk(admin_id, {
      include: [{ model: Cafeteria }],
    });
    if (row) {
      return { admin: row.dataValues };
    } else {
      throw new Error('Admin is Not Found');
    }
  }

  async countNotApproved() {
    try {
      const count = await this.AdminRepository.count({
        where: {
          approval_status: false,
        },
      });
      console.log('count');
      console.dir(count);
      return count;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async countAll() {
    try {
      const count = await this.AdminRepository.count();
      console.log('all count: ');
      console.dir(count);
      return count;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAllAdmins(where) {
    try {
      const rows = await this.AdminRepository.findAll({
        where: where,
        include: [
          {
            model: Cafeteria,
          },
        ],
      });
      return rows;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findAndCountAllAdmin(where) {
    try {
      const { count, rows } = await this.AdminRepository.findAndCountAll({
        where: where,
      });
      return {
        count: count,
        adminList: rows,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findCountOfAdmins(where) {
    try {
      const row = await this.AdminRepository.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('admin_id')), 'cnt_of_admins'],
        ],
        where: where,
      });
      return {
        count_of_admins: row.dataValues.cnt_of_admins,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = AdminService;
