import { Injectable } from '@nestjs/common';
import { DestinationRepository } from './destination.repository';

@Injectable()
export class DestinationService {
  constructor(private destinationDB: DestinationRepository) {}

  /**
   * @param page 보여줄 페이지
   * @param perPage 보여줄 여행지 개수
   * @returns 조회한 여행지별 아이디, 이름 리스트
   */
  async getDestinationNameList(
    page: number,
    perPage: number,
  ): Promise<{ id: string; name: string }[]> {
    const foundDestination = await this.destinationDB.getAllDestination(
      page,
      perPage,
    );

    /**
     * DB 결과가 배열이 아닌 경우,
     * DB 결과가 빈 배열인 경우
     */
    if (
      Array.isArray(foundDestination) === false ||
      foundDestination.length === 0 ||
      foundDestination.includes(null) ||
      foundDestination.includes(undefined)
    )
      return [];

    return foundDestination.map((destination) => ({
      id: destination.id,
      name: destination.name,
    }));
  }

  /**
   * @param destinationList 여행지별 아이디, 이름 리스트
   * @returns 여행지별 이미지 리스트
   */
  async getDestinationImageList(
    destinationList: { id: string; name: string }[],
  ): Promise<string[][]> {
    return await Promise.all(
      destinationList.map(async ({ id }) => {
        const foundImage = await this.destinationDB.getDestinationImageById(id);

        if (
          Array.isArray(foundImage) === false ||
          foundImage.length === 0 ||
          foundImage.some((result) => result === null || result === undefined)
        ) {
          return new Array(1).fill(null);
        }

        return foundImage.map((image) => image.image);
      }),
    );
  }

  /**
   * @param destinationList 여행지별 아이디, 이름 리스트
   * @returns 여행지별 추천도
   */
  async getRecommendation(
    destinationList: { id: string; name: string }[],
  ): Promise<number[]> {
    const result = await Promise.all(
      destinationList.map(
        async ({ id }) => await this.destinationDB.getRecommByDestId(id),
      ),
    );

    if (
      Array.isArray(result) === false ||
      result.length === 0 ||
      result.some((recomm) => recomm === null || recomm === undefined)
    ) {
      return new Array(destinationList.length).fill(0);
    }

    return result.map((recomm) => {
      if (recomm[0] === undefined) return 0;
      return recomm[0].count;
    });
  }

  /**
   * @param page 보여줄 페이지
   * @returns 조회한 여행지별 이미지, 이름, 추천도
   */
  async getAllDestination(page: number) {
    try {
      const perPage = 10;
      const nameAndIdList = await this.getDestinationNameList(page, perPage);
      if (nameAndIdList.length === 0) return [];

      const imageList = await this.getDestinationImageList(nameAndIdList);
      const recommendation = await this.getRecommendation(nameAndIdList);

      return nameAndIdList.map(({ name }, index) => ({
        image: imageList[index],
        name,
        recomm: recommendation[index],
      }));
    } catch (e) {
      throw { cause: e };
    }
  }
}
