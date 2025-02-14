import * as bcrypt from 'bcrypt';

export const mockDestination = [
  {
    id: '12345',
    name: '여행지1',
    address: '주소1',
    information: '설명',
    latitude: 37.123456,
    longitude: 127.123456,
    category: '카테고리1',
  },
  {
    id: '12346',
    name: '여행지2',
    address: '주소2',
    information: '설명',
    latitude: 37.123457,
    longitude: 127.123457,
    category: '카테고리1',
  },
  {
    id: '12347',
    name: '여행지3',
    address: '주소3',
    information: '설명',
    latitude: 37.123458,
    longitude: 127.123458,
    category: '카테고리2',
  },
  {
    id: '12348',
    name: '여행지4',
    address: '주소4',
    information: '설명',
    latitude: 37.123459,
    longitude: 127.123459,
    category: '카테고리2',
  },
  {
    id: '12349',
    name: '여행지5',
    address: '주소5',
    information: '설명',
    latitude: 37.123452,
    longitude: 127.123452,
    category: '카테고리3',
  },
];

export const mockImage = [{ image: 'image' }];
export const mockRecomm = [{ count: 1 }];
export const mockErrDestination = [
  { id: '23456', name: '식당1' },
  { id: '34567', name: '카페1' },
];

export const mockErrStr: unknown = 'test';
export const mockErrArr = [[null], []];

export const mockProfile = {
  fieldname: 'profile',
  originalname: 'test.png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  size: 419714,
} as Express.Multer.File;

export const password = 'test1234!';

export const mockUser = {
  email: 'test@test.com',
  name: '신짱구',
  password: bcrypt.hashSync(password, 10),
};
