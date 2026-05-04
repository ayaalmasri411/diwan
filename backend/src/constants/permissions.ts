// roles
export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'ENTRY_CLERK'
  | 'ARCHIVE_CLERK'
  | 'DATA_OFFICER'
  | 'REPORT_VIEWER'
  | 'INQUIRY_USER'
  | 'EMPLOYEE';

// offices
export type Office =
  | 'entry'
  | 'archive'
  | 'data'
  | 'reports'
  | 'inquiry'
  | 'messages';

// ربط الأدوار بالمكاتب المسموحة
export const RoleOfficeAccess: Record<Role, Office[]> = {
  SUPER_ADMIN: ['entry','archive','data','reports','inquiry','messages'],
  ADMIN: ['entry','archive','data','reports','inquiry','messages'],
  ENTRY_CLERK: ['entry','messages'],
  ARCHIVE_CLERK: ['archive','messages'],
  DATA_OFFICER: ['data','messages'],
  REPORT_VIEWER: ['reports'],
  INQUIRY_USER: ['inquiry'],
  EMPLOYEE: ['messages']
};