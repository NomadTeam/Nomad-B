import { Injectable, NotFoundException } from '@nestjs/common';
import { DestinationRepository } from '@destination/destination.repository';

@Injectable()
export class DestinationService {
  constructor(private destinationDB: DestinationRepository) {}

  /**
   * @param page 보여줄 페이지 번호
   * @returns 조회한 여행지별 아이디, 이름 리스트
   */
  async getDestinationNameList(
    page: number,
  ): Promise<{ id: string; name: string }[]> {
    const foundDestination = await this.destinationDB.getAllDestination(page);

    return foundDestination.length === 0
      ? []
      : foundDestination.map((destination) => ({
          id: destination.id,
          name: destination.name,
        }));
  }

  /**
   * @param destinationList 여행지별 아이디 리스트
   * @returns 여행지별 대표 이미지
   */
  async getDestinationMainImage(destinationList: { id: string }[]) {
    return await Promise.all(
      destinationList.map(async ({ id }) => {
        const foundImage = await this.destinationDB.getDestinationImageById(id);

        if (foundImage.length === 0) return new Object({ image: null });

        return foundImage[0];
      }),
    );
  }

  /**
   * @param destinationList 여행지별 아이디 리스트
   * @returns 여행지별 추천도
   */
  async getRecommendation(
    destinationList: { id: string }[],
  ): Promise<number[]> {
    const result = await Promise.all(
      destinationList.map(
        async ({ id }) => await this.destinationDB.getRecommByDestId(id),
      ),
    );

    return result.map((recomm) => recomm[0].count);
  }

  /**
   * 전체 여행지 조회 API
   * @param page 보여줄 페이지
   * @returns 조회한 여행지별 이미지, 이름, 추천도
   */
  async getAllDestination(page: number) {
    try {
      const nameAndIdList = await this.getDestinationNameList(page);
      if (nameAndIdList.length === 0) return [];

      const mainImage = await this.getDestinationMainImage(
        nameAndIdList.map(({ id }) => ({ id })),
      );

      const recommendation = await this.getRecommendation(
        nameAndIdList.map(({ id }) => ({ id })),
      );

      return nameAndIdList.map(({ id, name }, index) => ({
        ...mainImage[index],
        id,
        name,
        recomm: recommendation[index],
      }));
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param id 조회할 여행지 id
   * @returns 여행지 정보(아이디, 이름, 주소, 설명, 위도, 경도, 카테고리)
   */
  async validateDestination(id: string) {
    const foundDestination =
      await this.destinationDB.findOneDestinationById(id);

    if (foundDestination.length === 0)
      throw new NotFoundException('존재하지 않는 여행지입니다.');

    return foundDestination[0];
  }

  /**
   * @param id 조회할 여행지 id
   * @returns 해당 여행지의 이미지 리스트
   */
  async getDestinationImageList(id: string): Promise<string[]> {
    const foundImage = await this.destinationDB.getDestinationImageById(id);

    return foundImage.length === 0
      ? [null]
      : foundImage.map((image) => image.image);
  }

  /**
   * @param id 조회할 여행지 id
   * @returns 상세 페이지 정보(이미지, 여행지명, 주소, 설명, 위도, 경도, 카테고리)
   */
  async getDetailDestination(id: string) {
    try {
      const destination = await this.validateDestination(id);
      const imageList = await this.getDestinationImageList(id);
      const recommendation = await this.getRecommendation([{ id }]);

      delete destination.id;
      return {
        image: imageList,
        ...destination,
        recomm: recommendation[0],
      };
    } catch (e) {
      throw e;
    }
  }

  /**
   * 추천순 API
   * @param page - 조회할 페이지 번호
   * @returns 추천도가 높은 순으로 여행지 리스트 반환(20개씩)
   */
  async getAllDestinationOrderByRecomm(page: number) {
    try {
      const foundDestination =
        await this.destinationDB.getDestinationOrderByRecomm(page);
      if (foundDestination.length === 0) return [];

      const mainImage = await this.getDestinationMainImage(
        foundDestination.map(({ id }) => ({ id })),
      );

      return foundDestination.map((result, index) => ({
        ...mainImage[index],
        ...foundDestination[index],
      }));
    } catch (e) {
      throw e;
    }
  }

  /**
   * 가나다순 API
   * @param page 조회할 페이지 번호
   * @returns 이름 순으로 여행지 리스트 반환(20개씩)
   */
  async getAllDestinationOrderByName(page: number) {
    try {
      const foundDestination =
        await this.destinationDB.getDestinationOrderByName(page);
      if (foundDestination.length === 0) return [];

      const mainImage = await this.getDestinationMainImage(
        foundDestination.map(({ id }) => ({ id })),
      );

      return foundDestination.map((result, index) => ({
        ...mainImage[index],
        ...foundDestination[index],
      }));
    } catch (e) {
      throw e;
    }
  }
}
