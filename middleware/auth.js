const jwt = require('jsonwebtoken');
const users = require('../data/users');

const SECRET = 'SECRET_KEY';

module.exports = function (req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);

    const user = users.find(u => u.id === decoded.id);
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};