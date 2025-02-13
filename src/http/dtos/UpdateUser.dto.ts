export interface UpdateUserDto {
  readonly id: string;
  readonly full_name: string;
  readonly email: string;
  readonly password: string;
  readonly newPassword: string;
}
