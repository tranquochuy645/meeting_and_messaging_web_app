import bcrypt from 'bcrypt';

const hashPassword = (req: any, res: any, next: any) => {
  if (req.body && req.body.password) {
    const password = req.body.password;
    // Hash the password
    bcrypt.hash(
      password,
      10,
      (err, hash) => {
        if (err) {
          throw err;
        } else {
          // Update the request body with the hashed password
          req.body.password = hash
          // Continue to the next middleware or route handler
          next();
        }
      });
  }
};

export {
  hashPassword,
}
