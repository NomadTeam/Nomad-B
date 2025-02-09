import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class signUpUserDTO {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  email: string;

  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @IsString({ message: '이름은 문자열입니다.' })
  name: string;

  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString({ message: '비밀번호는 문자열입니다.' })
  password: string;

  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString({ message: '비밀번호는 문자열입니다.' })
  confirmPassword: string;
}
