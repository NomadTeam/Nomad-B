import { PERPAGE } from '@common/datas/constant-data';
import { CountType } from '@common/types/db-type';
import { ConnectRepository, sqlError } from '@data/data.repository';
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
      const sql = `SELECT count(id) as count FROM destination_recommendation WHERE user_email= ? AND destination_id= ?`;
      const [rows] = await this.pool.execute(sql, [email, destinationId]);
      return rows as CountType[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async addRecommendation(email: string, destinationId: string) {
    try {
      const sql = `INSERT INTO destination_recommendation(destination_id, user_email) VALUES(?,?)`;
      const [rows] = await this.pool.execute(sql, [destinationId, email]);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async getUsersLikeDestination(page: number, email: string) {
    try {
      const offset = (page - 1) * PERPAGE;
      const sql = `SELECT destination_id FROM destination_recommendation WHERE user_email = ? LIMIT ${offset}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql, [email]);
      return rows as { destination_id: string }[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async deleteUsersLikeDestination(email: string, id: string) {
    try {
      const sql = `DELETE FROM destination_recommendation WHERE user_email = ? AND destination_id = ?`;
      const [rows] = await this.pool.execute(sql, [email, id]);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }
}
