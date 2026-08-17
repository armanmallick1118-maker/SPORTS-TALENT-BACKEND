const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided, access denied, Sensei!' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Secures the route with the real user's ID, Sensei!
    next();
  } catch (error) {
    console.error("Auth Error, Sensei:", error);
    return res.status(401).json({ error: 'Invalid or expired token, Sensei!' });
  }
};

module.exports = verifyToken;