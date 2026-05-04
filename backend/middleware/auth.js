// مؤقت – لاحقًا JWT
module.exports = function mockAuth(req, res, next) {
  req.user = {
    id: 'u1',
    name: 'موظف إدخال',
    roles: ['ENTRY_CLERK'],
    office: 'entry',
  };

  next();
};