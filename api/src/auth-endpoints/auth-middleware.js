const jwt = require('jsonwebtoken');

const TOKEN_COOKIE_NAME = "PokeForgeLogin";

exports.TokenMiddleware = (req, res, next) => {

  // //Uncomment for testing to bypass authentication. Change req.user values if needed
  // req.user = {
  //   userid: 1,
  //   username: "usernamehere"
  // }
  // return next();

  let token = null;
  if (!req.cookies[TOKEN_COOKIE_NAME]) {
    //No cookie, check for Authorization header
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith("Bearer ")) {
      //Format should be "Bearer token"
      token = authHeader.split(" ")[1];
    }
  }
  else {
    token = req.cookies[TOKEN_COOKIE_NAME];
  }

  // no token
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.API_SECRET_KEY);
    req.user = decoded.user;
    next();
  }
  catch (err) { //Token is invalid
    return res.status(401).json({ error: 'Invalid Login Session' });
  }
}

exports.generateToken = (req, res, user) => {
  let data = {
    user: user,
    exp: Math.floor(Date.now() / 1000) + (6 * 60 * 60) // expire token in 6 hours
  }
  const token = jwt.sign(data, process.env.API_SECRET_KEY);
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true
  });
};


exports.removeToken = (req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME);
}

