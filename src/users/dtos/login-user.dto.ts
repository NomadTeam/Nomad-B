import { PickType } from '@nestjs/mapped-types';
import { signUpUserDTO } from './sign-up-user.dto';

export class loginUserDTO extends PickType(signUpUserDTO, [
  'email',
  'password',
]) {}
