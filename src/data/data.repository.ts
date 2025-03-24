import { PERPAGE } from '@common/datas/constant-data';
import { DestinationType } from '@common/types/db-type';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

export function sqlError(error: { sqlMessage: string }) {
  if (error === undefined || error === null)
    return { error: '알 수 없는 에러', message: error };
  return { error: 'sql 에러', message: error.sqlMessage };
}

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

  async search(word: string, page: number) {
    try {
      const searchWord = `%${word}%`;
      const offset = (page - 1) * PERPAGE;
      const sql = `SELECT * FROM destination WHERE name LIKE ? OR address LIKE ? OR information LIKE ? LIMIT ${offset}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql, [
        searchWord,
        searchWord,
        searchWord,
      ]);

      return rows as DestinationType[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }
}
