import jwt from 'jsonwebtoken';


export function withAuth(handler) {
  return async (req, res) => {
    try {
      console.log("Validating token: ", req.headers)
      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Missing token' });
      }

      const decodedData = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decodedData;

      return handler(req, res);
    } catch (error) {
      console.error(error);

      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
