import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DataModule } from '@data/data.module';
import { UsersRepository } from '../users.repository';
import { signUpUserDTO } from '../dtos/sign-up-user.dto';
import { RowDataPacket } from 'mysql2';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { mockProfile, mockUser, password } from '@common/mocks/mock-data';

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
            findUserByEmail: jest.fn().mockResolvedValue([
              {
                image: 'test@test.com/profile/1738222211211_test.jpg',
                name: mockUser.name,
                password: mockUser.password,
              },
            ]),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
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
    expect(userRepository).toBeDefined();
  });

  describe('회원가입 API', () => {
    it('회원가입하려는 유저의 이메일이 db에 존재하는 경우 400 에러', async () => {
      jest
        .spyOn(userRepository, 'isDuplicateEmail')
        .mockResolvedValue([{ count: 1 }] as RowDataPacket[]);
      await expect(
        service.signUpUser(mockProfile, existedUser),
      ).rejects.toThrow(BadRequestException);
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

  describe('로그인 API', () => {
    it('이메일이 db에 존재하지 않는 경우, 401 에러', async () => {
      jest
        .spyOn(userRepository, 'isDuplicateEmail')
        .mockResolvedValue([{ count: 0 }] as RowDataPacket[]);
      await expect(
        service.logInUser({ email: newUser.email, password: newUser.password }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호가 db에 저장된 비밀번호와 불일치하는 경우, 401 에러', async () => {
      jest
        .spyOn(userRepository, 'isDuplicateEmail')
        .mockResolvedValue([{ count: 1 }] as RowDataPacket[]);

      await expect(
        service.logInUser({ email: mockUser.email, password: 'test123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('로그인 성공', async () => {
      jest
        .spyOn(userRepository, 'isDuplicateEmail')
        .mockResolvedValue([{ count: 1 }] as RowDataPacket[]);

      const result = await service.logInUser({
        email: mockUser.email,
        password,
      });
      expect(result).toStrictEqual({
        profile: 'test@test.com/profile/1738222211211_test.jpg',
        token: 'mock-jwt-token',
      });
    });
  });
});
