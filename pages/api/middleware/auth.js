import jwt from 'jsonwebtoken';


export function withAuth(handler) {
  return async (req, res) => {
    let decodedData = null;
    try {
      console.log("Validating token: ", req.headers)
      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Missing token' });
      }

      decodedData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decodedData;

    return await handler(req, res);
    
  };
}
