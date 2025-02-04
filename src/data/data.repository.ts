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
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    });
  }

  getPool(): mysql.Pool {
    return this.pool;
  }
}
