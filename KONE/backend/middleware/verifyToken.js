const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization (Bearer token)

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ success: false, message: 'Format du token invalide' });
    }

    const token = parts[1];

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Token invalide ou expiré' });
      }
      // Stocker les infos décodées dans la requête pour la suite
      
      req.currUser = decoded;
      req.userId = decoded.id_users || decoded.id || decoded.userId;
      req.userEmail = decoded.email;
      next();
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur interne', error: error.message });
  }
};

module.exports = verifyToken;
