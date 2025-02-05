import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { DataModule } from '@data/data.module';
import { UsersRepository } from './users.repository';
import { signUpUserDTO } from './dtos/sign-up-user.dto';
import { RowDataPacket } from 'mysql2';
import { BadRequestException } from '@nestjs/common';

const mockProfile = {
  fieldname: 'profile',
  originalname: 'test.png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  size: 419714,
} as Express.Multer.File;

const password = 'test1234!';

const mockUser = {
  email: 'test@test.com',
  name: '신짱구',
  password: bcrypt.hashSync(password, 10),
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UsersRepository;

  const existedUser: signUpUserDTO = {
    email: mockUser.email,
    name: mockUser.name,
    password,
    confirmPassword: password,
  };

  const newUser: signUpUserDTO = {
    email: 'test1@test.com',
    name: mockUser.name,
    password,
    confirmPassword: password,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataModule],
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            isDuplicateEmail: jest.fn(),
            registerUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UsersRepository>(UsersRepository);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('회원가입하려는 유저의 이메일이 db에 존재하는 경우 400 에러', async () => {
    jest
      .spyOn(userRepository, 'isDuplicateEmail')
      .mockResolvedValue([{ count: 1 }] as RowDataPacket[]);
    await expect(service.signUpUser(mockProfile, existedUser)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('회원가입하려는 유저의 password와 confirmPassword가 불일치하는 경우 400 에러', async () => {
    jest
      .spyOn(userRepository, 'isDuplicateEmail')
      .mockResolvedValue([{ count: 0 }] as RowDataPacket[]);
    await expect(
      service.signUpUser(mockProfile, {
        ...newUser,
        confirmPassword: 'test123',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('회원가입 성공', async () => {
    jest
      .spyOn(userRepository, 'isDuplicateEmail')
      .mockResolvedValue([{ count: 0 }] as RowDataPacket[]);
    const result = await service.signUpUser(mockProfile, newUser);
    expect(result).toStrictEqual({
      profile: result.profile,
      message: '회원가입 완료되었습니다 :)',
    });
  });
});
