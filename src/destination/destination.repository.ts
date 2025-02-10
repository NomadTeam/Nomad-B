import { ConnectRepository } from '@data/data.repository';
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DestinationRepository {
  private readonly pool: mysql.Pool;
  constructor(private connectRepository: ConnectRepository) {
    this.pool = this.connectRepository.getPool();
  }

  async getAllDestination(page: number, perPage: number) {
    const sql = `SELECT * FROM destination LIMIT ${(page - 1) * perPage}, ${perPage}`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }

  async getDestinationImageById(id: string) {
    const sql = `SELECT image FROM destination_image WHERE destination_id= "${id}"`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }

  async getRecommByDestId(destinationId: string) {
    const sql = `SELECT COUNT(id) as count FROM destination_recommendation WHERE destination_id = "${destinationId}"`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }
}
