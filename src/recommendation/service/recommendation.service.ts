import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecommendationRepository } from '../recommendation.repository';
import { DestinationRepository } from '@destination/destination.repository';
import { error } from 'console';
import * as mysql from 'mysql2/promise';
import { ConnectRepository } from '@data/data.repository';
import { DestinationService } from '@destination/service/destination.service';

@Injectable()
export class RecommendationService {
  private readonly pool: mysql.Pool;
  constructor(
    private recommDB: RecommendationRepository,
    private destDB: DestinationRepository,
    private connectDB: ConnectRepository,
    private destinationService: DestinationService,
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

  /**
   * 유저가 좋아요 누른 여행지 id 리스트 반환하는 함수
   * @param page 보여줄 여행지 페이지 번호
   * @param email 유저 이메일
   * @returns 유저가 좋아요 누른 여행지 id 리스트
   */
  async getDestinationIdList(page: number, email: string) {
    const foundDestination = await this.recommDB.getUsersLikeDestination(
      page,
      email,
    );
    if (Array.isArray(foundDestination) === false) return [];
    if (
      foundDestination.length === 0 ||
      foundDestination.includes(null) ||
      foundDestination.includes(undefined)
    )
      return [];

    return foundDestination.map((id) => id.destination_id);
  }

  /**
   * 유저가 추천 누른 여행지 조회 API
   * @param page 보여줄 여행지 페이지 번호
   * @param email 유저 이메일
   * @returns 유저가 추천 누른 여행지 정보 리스트(20개씩)
   */
  async getUsersLike(page: number, email: string) {
    try {
      const destinationIdList = await this.getDestinationIdList(page, email);

      if (destinationIdList.length === 0) return [];
      const destinationList = (
        await Promise.all(
          destinationIdList.map(
            async (id) => await this.destDB.findOneDestinationById(id),
          ),
        )
      ).flat();

      const foundImage = await this.destinationService.getDestinationMainImage(
        destinationIdList.map((id) => ({ id })),
      );

      const foundRecomm = await this.destinationService.getRecommendation(
        destinationIdList.map((id) => ({ id })),
      );

      return destinationIdList.map((id, index) => ({
        ...foundImage[index],
        ...destinationList[index],
        recomm: foundRecomm[index],
      }));
    } catch (e) {
      throw e;
    }
  }

  /**
   * 추천 취소 API와 관련된 데이터 유효성 검증 함수
   * @param email 유저 이메일
   * @param id 유저가 추천 취소하려는 여행지 ID
   */
  async validateDeleteData(email: string, id: string) {
    const existedDestination = await this.destDB.findOneDestinationById(id);
    if (
      Array.isArray(existedDestination) === false ||
      existedDestination.length === 0 ||
      existedDestination.includes(null) ||
      existedDestination.includes(undefined) ||
      existedDestination[0] === undefined
    )
      throw new NotFoundException('존재하지 않는 여행지입니다.');

    const foundDestination =
      await this.recommDB.findOneRecommendationByEmailAndDestId(email, id);
    if (foundDestination[0].count === 0) {
      throw new ForbiddenException('추천한 여행지에 한하여 취소 가능합니다.');
    }
  }

  /**
   * 추천 취소 API
   * @param email 유저 이메일
   * @param id 유저가 추천 취소하려는 여행지 ID
   */
  async deleteUsersLike(email: string, id: string) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction(); // 트랜잭션 시작

      await this.validateDeleteData(email, id);
      await this.recommDB.deleteUsersLikeDestination(email, id);

      await connection.commit(); // 트랜잭션 커밋
    } catch (e) {
      await connection.rollback(); // 에러 발생 시 트랜잭션 롤백
      throw e;
    } finally {
      connection.release(); // 커넥션 반환
    }
  }
}
