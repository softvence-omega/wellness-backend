import { Request } from 'express';


export enum UserType {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  ADMIN = 'admin',
}


export interface AuthenticatedRequest extends Request {
  user: {
    sub: string; // User ID
    email: string;
    roles: UserType;
  };
}
