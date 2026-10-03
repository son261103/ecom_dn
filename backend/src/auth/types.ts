import type { Role } from '../generated/prisma/enums.js';

export interface RequestUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}