import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { DataModule } from '@data/data.module';
import { UsersRepository } from './users.repository';
import { signUpUserDTO } from './dtos/sign-up-user.dto';
import { RowDataPacket } from 'mysql2';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
      ).rejects.toMatchObject({
        cause: new BadRequestException('이미 존재하는 이메일입니다.'),
      });
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
      ).rejects.toMatchObject({
        cause: new BadRequestException('비밀번호가 일치하지 않습니다.'),
      });
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
      ).rejects.toMatchObject({
        cause: new UnauthorizedException(
          '이메일이나 비밀번호가 일치하지 않습니다.',
        ),
      });
    });

    it('비밀번호가 db에 저장된 비밀번호와 불일치하는 경우, 401 에러', async () => {
      jest
        .spyOn(userRepository, 'isDuplicateEmail')
        .mockResolvedValue([{ count: 1 }] as RowDataPacket[]);

      await expect(
        service.logInUser({ email: mockUser.email, password: 'test123' }),
      ).rejects.toMatchObject({
        cause: new UnauthorizedException(
          '이메일이나 비밀번호가 일치하지 않습니다.',
        ),
      });
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
