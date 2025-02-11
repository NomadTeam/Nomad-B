import { ConnectRepository } from '@data/data.repository';
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class RecommendationRepository {
  private readonly pool: mysql.Pool;

  constructor(private readonly connectRepository: ConnectRepository) {
    this.pool = this.connectRepository.getPool();
  }

  async findOneRecommendationByEmailAndDestId(
    email: string,
    destinationId: string,
  ) {
    const sql = `SELECT count(id) as count FROM destination_recommendation WHERE user_email= "${email}" AND destination_id= "${destinationId}"`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }

  async addRecommendation(email: string, destinationId: string) {
    const sql = `INSERT INTO destination_recommendation(destination_id, user_email) VALUES("${destinationId}","${email}")`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }
}
