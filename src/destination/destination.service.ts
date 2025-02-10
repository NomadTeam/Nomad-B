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

    if (Array.isArray(foundDestination)) {
      return foundDestination.map((destination) => ({
        id: destination.id,
        name: destination.name,
      }));
    }

    return [];
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

        return Array.isArray(foundImage)
          ? foundImage.map((image) => image.image)
          : [null];
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

    return Array.isArray(result)
      ? result.map((recomm) => recomm[0].count)
      : new Array(destinationList.length).fill(0);
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
