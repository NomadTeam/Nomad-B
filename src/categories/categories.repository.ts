import { ConnectRepository } from '@data/data.repository';
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class CategoryRepository {
  private readonly pool: mysql.Pool;
  constructor(private connectRepository: ConnectRepository) {
    this.pool = this.connectRepository.getPool();
  }

  async getAllCategory() {
    const sql = `SELECT name FROM categories ORDER BY name`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }
}
