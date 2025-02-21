import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConnectRepository, sqlErrorFunction } from '@data/data.repository';
import * as mysql from 'mysql2/promise';

@Injectable()
export class UsersRepository {
  private readonly pool: mysql.Pool;

  constructor(private readonly connectDB: ConnectRepository) {
    this.pool = this.connectDB.getPool();
  }

  async isDuplicateEmail(email: string) {
    try {
      const sql = `SELECT COUNT(email) as count FROM users WHERE email = "${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async registerUser(
    image: string,
    email: string,
    name: string,
    password: string,
  ) {
    try {
      const sql = `INSERT INTO users VALUES("${email}", "${name}", "${password}", "${image}")`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async findUserByEmail(email: string) {
    try {
      const sql = `SELECT image, name, password FROM users WHERE email = ${email}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }
}
