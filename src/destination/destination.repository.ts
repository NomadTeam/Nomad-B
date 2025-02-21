import { ConnectRepository, sqlErrorFunction } from '@data/data.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { PERPAGE } from '@common/datas/constant-data';

@Injectable()
export class DestinationRepository {
  private readonly pool: mysql.Pool;
  constructor(private connectRepository: ConnectRepository) {
    this.pool = this.connectRepository.getPool();
  }

  async getAllDestination(page: number) {
    try {
      const sql = `SELECT * FROM destination LIMIT ${(page - 1) * PERPAGE}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async getDestinationImageById(id: string) {
    try {
      const sql = `SELECT image FROM destination_image WHERE destination_id= "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async getRecommByDestId(destinationId: string) {
    try {
      const sql = `SELECT COUNT(id) as count FROM destination_recommendation WHERE destination_id = "${destinationId}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async findOneDestinationById(id: string) {
    try {
      const sql = `SELECT * FROM destination WHERE id = "${id}"`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async getDestinationOrderByName(page: number) {
    try {
      const sql = `SELECT d.*, COALESCE(COUNT(r.destination_id), 0) AS recomm 
                   FROM destination AS d 
                   LEFT JOIN destination_recommendation AS r 
                   ON d.id = r.destination_id 
                   GROUP BY d.id 
                   ORDER BY name 
                   LIMIT ${(page - 1) * PERPAGE}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }

  async getDestinationOrderByRecomm(page: number) {
    try {
      const sql = `SELECT d.*, COALESCE(COUNT(r.destination_id), 0) AS recomm 
                   FROM destination AS d 
                   LEFT JOIN destination_recommendation AS r
                   ON d.id = r.destination_id 
                   GROUP BY d.id 
                   ORDER BY recomm DESC, name
                   LIMIT ${(page - 1) * PERPAGE}, ${PERPAGE}`;
      const [rows] = await this.pool.execute(sql);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException(sqlErrorFunction(e));
    }
  }
}
