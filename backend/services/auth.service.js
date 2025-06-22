// src/services/auth.service.js
const bcrypt = require('bcrypt');
const prisma = require('../config/db.js');
const { generateToken } = require('../utils/jwt.js');

exports.signup = async ({ user_id, password, role }) => {
  const existingUser = await prisma.user.findUnique({ where: { user_id } });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      user_id,
      password: hashedPassword,
      role : role || "STUDENT",
    },
    select: {
      id: true,
      user_id: true,
      role: true,
    },
  });

  return newUser;
};

exports.login = async ({ user_id, password }) => {
  const user = await prisma.user.findUnique({ where: { user_id } });
  if (!user || user.is_deleted) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken({ id: user.id, role: user.role });
  return token;
};
