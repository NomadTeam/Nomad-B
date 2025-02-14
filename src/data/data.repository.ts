import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class ConnectRepository {
  private readonly pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  }

  getPool(): mysql.Pool {
    return this.pool;
  }

  async search(word: string, page: number, perPage: number) {
    const sql = `SELECT * FROM destination WHERE name LIKE "%${word}%" OR address LIKE "%${word}%" OR information LIKE"%${word}%" LIMIT ${(page - 1) * perPage}, ${perPage}`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }
}
