import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecommendationRepository } from '../recommendation.repository';
import { DestinationRepository } from '@destination/destination.repository';
import { error } from 'console';
import * as mysql from 'mysql2/promise';
import { ConnectRepository } from '@data/data.repository';

@Injectable()
export class RecommendationService {
  private readonly pool: mysql.Pool;
  constructor(
    private recommDB: RecommendationRepository,
    private destDB: DestinationRepository,
    private connectDB: ConnectRepository,
  ) {
    this.pool = this.connectDB.getPool();
  }

  /**
   * @param email 추천 버튼을 누른 유저 이메일
   * @param id 유저가 추천하고자 하는 여행지 아이디
   */
  async validateData(email: string, id: string) {
    const foundDestination = await this.destDB.findOneDestinationById(id);
    if (foundDestination[0] === undefined) {
      throw new NotFoundException('존재하지 않는 여행지입니다.', {
        cause: error,
      });
    }

    const foundRecommendation =
      await this.recommDB.findOneRecommendationByEmailAndDestId(email, id);
    if (foundRecommendation[0].count !== 0)
      throw new BadRequestException('이미 추천한 여행지입니다!');
  }

  /**
   * @param email 추천 버튼을 누른 유저 이메일
   * @param id 유저가 추천하고자 하는 여행지 아이디
   * @returns 성공 메시지 및 추천도
   */
  async pushRecommendation(email: string, id: string) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction(); // 트랜잭션 시작

      await this.validateData(email, id);

      await this.recommDB.addRecommendation(email, id);
      await connection.commit(); // 트랜잭션 커밋

      const result = await this.destDB.getRecommByDestId(id);
      return { recomm: result[0].count, message: '추천 완료' };
    } catch (e) {
      await connection.rollback(); // 에러 발생 시 트랜잭션 롤백
      throw e;
    } finally {
      connection.release(); // 커넥션 반환
    }
  }
}
