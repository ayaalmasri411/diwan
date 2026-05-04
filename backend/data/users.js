const bcrypt = require('bcryptjs');

module.exports = [
  {
    id: 'u1',
    username: 'entry',
    password: bcrypt.hashSync('1234', 10),
    name: 'موظف الإدخال',
    roles: ['ENTRY_CLERK'],
    office: 'entry',
  },
  {
    id: 'u2',
    username: 'archive',
    password: bcrypt.hashSync('1234', 10),
    name: 'موظف الأرشيف',
    roles: ['ARCHIVE_CLERK'],
    office: 'archive',
  },
  {
    id: 'admin',
    username: 'admin',
    password: bcrypt.hashSync('admin', 10),
    name: 'مدير النظام',
    roles: ['ADMIN'],
    office: 'entry',
  }
];