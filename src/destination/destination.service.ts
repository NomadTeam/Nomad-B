import { Injectable, NotFoundException } from '@nestjs/common';
import { DestinationRepository } from '@destination/destination.repository';

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
   * @returns 여행지별 대표 이미지
   */
  async getDestinationMainImage(destinationList: { id: string }[]) {
    return await Promise.all(
      destinationList.map(async ({ id }) => {
        const foundImage = await this.destinationDB.getDestinationImageById(id);

        if (Array.isArray(foundImage) === false)
          return new Object({ image: null });

        if (
          foundImage.includes(null) ||
          foundImage.includes(undefined) ||
          foundImage.length === 0
        )
          return new Object({ image: null });

        return foundImage[0];
      }),
    );
  }

  /**
   * @param destinationList 여행지별 아이디, 이름 리스트
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

    if (
      result.length === 0 ||
      result.includes(null) ||
      result.includes(undefined)
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
      throw { cause: e };
    }
  }

  /**
   * @param id 조회할 여행지 id
   * @returns 여행지 정보(아이디, 이름, 주소, 설명, 위도, 경도, 카테고리)
   */
  async validateDestination(id: string) {
    const foundDestination =
      await this.destinationDB.findOneDestinationById(id);

    if (Array.isArray(foundDestination) === false)
      throw new NotFoundException('존재하지 않는 여행지입니다.');

    if (
      foundDestination.includes(null) ||
      foundDestination.includes(undefined) ||
      foundDestination.length === 0
    )
      throw new NotFoundException('존재하지 않는 여행지입니다.');

    return Object(foundDestination[0]);
  }

  /**
   * @param id 조회할 여행지 id
   * @returns 해당 여행지의 이미지 리스트
   */
  async getDestinationImageList(id: string): Promise<string[]> {
    const foundImage = await this.destinationDB.getDestinationImageById(id);
    if (Array.isArray(foundImage) === false) return [null];

    if (
      foundImage.includes(undefined) ||
      foundImage.includes(null) ||
      foundImage.length === 0
    )
      return [null];

    return foundImage.map((image) => image.image);
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
      throw { cause: e };
    }
  }
}
