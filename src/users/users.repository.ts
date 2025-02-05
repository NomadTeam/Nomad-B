import { Injectable } from '@nestjs/common';
import { ConnectRepository } from '@data/data.repository';
import * as mysql from 'mysql2/promise';

@Injectable()
export class UsersRepository {
  private readonly pool: mysql.Pool;

  constructor(private readonly connectDB: ConnectRepository) {
    this.pool = this.connectDB.getPool();
  }

  async isDuplicateEmail(email: string) {
    const sql = `SELECT COUNT(email) FROM users WHERE email = ${email}`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }

  async registerUser(
    image: string,
    email: string,
    name: string,
    password: string,
  ) {
    const sql = `INSERT INTO users VALUES(${image}, ${email}, ${name}, ${password})`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }
}
