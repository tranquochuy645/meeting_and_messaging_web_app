import bcrypt from 'bcrypt';
import { isWeakPassword } from '../../../lib/isWeakPassword';

const handleRegPassword = (req: any, res: any, next: any) => {
  if (req?.body?.password) {
    const password = req.body.password;
    if (isWeakPassword(password)) {
      return res.status(422).json({ message: "Weak Password" })
    }
    // Hash the password
    return bcrypt.hash(
      password,
      10,
      (err, hash) => {
        if (err) {
          throw err;
        } else {
          // Update the request body with the hashed password
          req.body.password = hash
          // Continue to the next middleware or route handler
          return next();
        }
      });
  }
  res.status(400).json({ message: "Missing password" })
};

export {
  handleRegPassword
}
