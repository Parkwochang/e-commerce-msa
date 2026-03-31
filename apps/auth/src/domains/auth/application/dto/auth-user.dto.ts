export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  status: 'ACTIVE' | 'LOCKED';
}
