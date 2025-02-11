import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecommendationRepository } from './recommendation.repository';
import { DestinationRepository } from '@destination/destination.repository';
import { error } from 'console';

@Injectable()
export class RecommendationService {
  constructor(
    private recommDB: RecommendationRepository,
    private destDB: DestinationRepository,
  ) {}

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
   * @returns 성공 메시지
   */
  async pushRecommendation(email: string, id: string) {
    try {
      await Promise.all([
        this.validateData(email, id),
        this.recommDB.addRecommendation(email, id),
      ]);

      return { message: '추천 완료' };
    } catch (e) {
      throw e;
    }
  }
}
