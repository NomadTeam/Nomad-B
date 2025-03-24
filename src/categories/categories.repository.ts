import { ConnectRepository, sqlError } from '@data/data.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class CategoryRepository {
  private readonly pool: mysql.Pool;
  constructor(private connectRepository: ConnectRepository) {
    this.pool = this.connectRepository.getPool();
  }

  async getAllCategory() {
    try {
      const sql = `SELECT name FROM categories ORDER BY name`;
      const [rows] = await this.pool.execute(sql);
      return rows as { name: string }[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }
}
