import { ConnectRepository, sqlError } from '@data/data.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { PERPAGE } from '@common/datas/constant-data';
import { CountType, DestinationType } from '@common/types/db-type';

@Injectable()
export class DestinationRepository {
  private readonly pool: mysql.Pool;
  constructor(private connectRepository: ConnectRepository) {
    this.pool = this.connectRepository.getPool();
  }

  async getAllDestination(page: number) {
    try {
      const offset = (page - 1) * PERPAGE;
      const sql = `SELECT * FROM destination LIMIT ${offset}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql);
      return rows as DestinationType[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async getDestinationImageById(id: string) {
    try {
      const sql = `SELECT image FROM destination_image WHERE destination_id= ?`;
      const [rows] = await this.pool.execute(sql, [id]);
      return rows as { image: string }[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async getRecommByDestId(destinationId: string) {
    try {
      const sql = `SELECT COUNT(id) as count FROM destination_recommendation WHERE destination_id = ?`;
      const [rows] = await this.pool.execute(sql, [destinationId]);
      return rows as CountType[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async findOneDestinationById(id: string) {
    try {
      const sql = `SELECT * FROM destination WHERE id = ?`;
      const [rows] = await this.pool.execute(sql, [id]);
      return rows as DestinationType[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async getDestinationOrderByName(page: number) {
    try {
      const offset = (page - 1) * PERPAGE;
      const sql = `SELECT d.*, COALESCE(COUNT(r.destination_id), 0) AS recomm 
                   FROM destination AS d 
                   LEFT JOIN destination_recommendation AS r 
                   ON d.id = r.destination_id 
                   GROUP BY d.id 
                   ORDER BY name 
                   LIMIT ${offset}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql);
      return rows as DestinationType[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }

  async getDestinationOrderByRecomm(page: number) {
    try {
      const offset = (page - 1) * PERPAGE;
      const sql = `SELECT d.*, COALESCE(COUNT(r.destination_id), 0) AS recomm 
                   FROM destination AS d 
                   LEFT JOIN destination_recommendation AS r
                   ON d.id = r.destination_id 
                   GROUP BY d.id 
                   ORDER BY recomm DESC, name
                   LIMIT ${offset}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql);
      return rows as DestinationType[];
    } catch (e) {
      throw new InternalServerErrorException(sqlError(e));
    }
  }
}
