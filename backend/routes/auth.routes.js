const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const users = require('../data/users');

const SECRET = 'SECRET_KEY';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'مستخدم غير موجود' });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ message: 'كلمة المرور خاطئة' });

  const token = jwt.sign(
    { id: user.id, roles: user.roles, office: user.office },
    SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token });
});

module.exports = router;