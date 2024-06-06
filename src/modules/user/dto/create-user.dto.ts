export class CreateUserDto {
  name?: string;
  password?: string;
  email?: string;
  nickname?: string;
  bio?: string;
  [key: string]: any;
}
