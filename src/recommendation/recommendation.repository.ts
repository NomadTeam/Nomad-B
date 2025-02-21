import { PERPAGE } from '@common/datas/constant-data';
import { ConnectRepository, sqlErrorFunction } from '@data/data.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    try {
      const sql = `SELECT count(id) as count FROM destination_recommendation WHERE user_email= "${email}" AND destination_id= "${destinationId}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async addRecommendation(email: string, destinationId: string) {
    try {
      const sql = `INSERT INTO destination_recommendation(destination_id, user_email) VALUES("${destinationId}","${email}")`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async getUsersLikeDestination(page: number, email: string) {
    try {
      const sql = `SELECT destination_id FROM destination_recommendation WHERE user_email = "${email}" LIMIT ${(page - 1) * PERPAGE}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async deleteUsersLikeDestination(email: string, id: string) {
    try {
      const sql = `DELETE FROM destination_recommendation WHERE user_email = "${email}" AND destination_id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }
}
