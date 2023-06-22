// pages/api/login.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '@/utils/findUser';
import { logEvent } from '@/utils/metricsWaveUtils';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {

    console.log("Looking for user with email: ", email)
    const user = await findUserByEmail(email)

    if(!user) {
      await logEvent("login", {
        email,
        plan: '',
        result: 'error'
      })


      console.log("There is no user with that email (", email, ")")
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }    
    console.log("comparing pwds - ", password, " with ", user.hashPwd)

    // Compare the password hash stored in the database with the password entered by the user
    const passwordMatch = await bcrypt.compare(password, user.hashPwd);

    if (!passwordMatch) {
      await logEvent("login", {
        email,
        plan: '',
        result: 'error'
      })


      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JSON Web Token (JWT) for the user
    const token = jwt.sign({ email: user.email, id: user._id, credits: user.credits, plan: user.plan }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.setHeader('Set-Cookie', `jwtToken=${token}; HttpOnly; Max-Age=36000; SameSite=Lax; Path=/`)


    await logEvent("login", {
      email: user.email,
      plan: user.plan,
      result: 'success'
    })

    res.status(200).json({ token });

    // Close the database connection
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
