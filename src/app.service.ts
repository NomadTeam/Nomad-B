import { ConnectRepository } from '@data/data.repository';
import { DestinationService } from '@destination/service/destination.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    private readonly db: ConnectRepository,
    private readonly destinationService: DestinationService,
  ) {}

  /**
   * @param search 검색 내용
   * @param page 조회할 페이지 번호
   * @returns 검색한 여행지 정보 리스트(여행지 아이디, 이름, 주소, 정보, 위도, 경도, 카테고리)
   */
  async findSearch(search: string[], page: number) {
    const searchList = await Promise.all(
      search.map(async (word) => {
        const foundDestination = await this.db.search(word, page);
        return foundDestination;
      }),
    );

    return searchList.flat().map((result) => {
      return {
        id: result['id'],
        name: result['name'],
        address: result['address'],
        information: result['information'],
        latitude: result['latitude'],
        longitude: result['longitude'],
        category: result['category'],
      };
    });
  }

  /**
   * 검색 API
   * @param search 검색 내용
   * @param page 보여줄 페이지 번호
   * @returns 검색 내용 결과 리스트
   */
  async search(search: string, page: number) {
    try {
      const words = search.split(' ');
      const foundSearch = await this.findSearch(words, page);

      const mainImage = await this.destinationService.getDestinationMainImage(
        foundSearch.map(({ id }) => ({ id })),
      );

      const recomm = await this.destinationService.getRecommendation(
        foundSearch.map(({ id }) => ({ id })),
      );

      return foundSearch.map((result, index) => ({
        ...mainImage[index],
        ...result,
        recomm: recomm[index],
      }));
    } catch (e) {
      throw e;
    }
  }
}
