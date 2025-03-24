import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConnectRepository, sqlError } from '@data/data.repository';
import * as mysql from 'mysql2/promise';
import { CountType } from '@common/types/db-type';

@Injectable()
export class UsersRepository {
  private readonly pool: mysql.Pool;

  constructor(private readonly connectDB: ConnectRepository) {
    this.pool = this.connectDB.getPool();
  }

  async isDuplicateEmail(email: string) {
    try {
      const sql = `SELECT COUNT(email) as count FROM users WHERE email = ?`;
      const [rows] = await this.pool.execute(sql, [email]);
      return rows as CountType[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async registerUser(
    image: string,
    email: string,
    name: string,
    password: string,
  ) {
    try {
      const sql = `INSERT INTO users VALUES(?, ?, ?, ?)`;
      const [rows] = await this.pool.execute(sql, [
        email,
        name,
        password,
        image,
      ]);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async findUserByEmail(email: string) {
    try {
      const sql = `SELECT image, name, password FROM users WHERE email = ?`;
      const [rows] = await this.pool.execute(sql, [email]);
      return rows as { image: string; name: string; password: string }[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }
}
