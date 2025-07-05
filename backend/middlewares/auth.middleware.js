const { verifyToken: verifyJWT } = require('../utils/jwt');
const prisma = require('../config/db'); // adjust path if needed

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyJWT(token); // decoded should have .id

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        user_id: true,
        role: true,
        is_deleted: true
      }
    });

    if (!user || user.is_deleted) {
      return res.status(403).json({ message: 'User not found or deactivated' });
    }

    // Attach to req.user
    req.user = {
      id: user.id,
      user_id: user.user_id,
      role: user.role
    };

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = {
  verifyToken
};
