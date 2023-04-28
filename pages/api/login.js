// pages/api/login.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '@/utils/findUser';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {

    console.log("Looking for user with email: ", email)
    const user = await findUserByEmail(email)

    if(!user) {
      console.log("There is no user with that email (", email, ")")
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }    
    console.log("comparing pwds - ", password, " with ", user.hashPwd)

    // Compare the password hash stored in the database with the password entered by the user
    const passwordMatch = await bcrypt.compare(password, user.hashPwd);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JSON Web Token (JWT) for the user
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.setHeader('Set-Cookie', `jwtToken=${token}; HttpOnly; Max-Age=36000; SameSite=Strict; Path=/`)


    res.status(200).json({ token });

    // Close the database connection
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
