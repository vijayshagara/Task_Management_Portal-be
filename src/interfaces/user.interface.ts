export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'developer';
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserTokenPayload {
  id: string;
  email: string;
  role: 'admin' | 'developer';
}