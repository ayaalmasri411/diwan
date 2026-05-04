// roles
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ENTRY_CLERK: 'ENTRY_CLERK',
  ARCHIVE_CLERK: 'ARCHIVE_CLERK',
  DATA_OFFICER: 'DATA_OFFICER',
  REPORT_VIEWER: 'REPORT_VIEWER',
  INQUIRY_USER: 'INQUIRY_USER',
  EMPLOYEE: 'EMPLOYEE',
};

// offices
const OFFICES = {
  ENTRY: 'entry',
  ARCHIVE: 'archive',
  DATA: 'data',
  REPORTS: 'reports',
  INQUIRY: 'inquiry',
  MESSAGES: 'messages',
};

// role → allowed offices
const RoleOfficeAccess = {
  SUPER_ADMIN: Object.values(OFFICES),
  ADMIN: Object.values(OFFICES),
  ENTRY_CLERK: [OFFICES.ENTRY, OFFICES.MESSAGES],
  ARCHIVE_CLERK: [OFFICES.ARCHIVE, OFFICES.MESSAGES],
  DATA_OFFICER: [OFFICES.DATA, OFFICES.MESSAGES],
  REPORT_VIEWER: [OFFICES.REPORTS],
  INQUIRY_USER: [OFFICES.INQUIRY],
  EMPLOYEE: [OFFICES.MESSAGES],
};

module.exports = { ROLES, OFFICES, RoleOfficeAccess };