import bcrypt from 'bcrypt';

// Hash function using bcrypt
const hashPassword = (password:string) => {
  const saltRounds = 10; // Number of salt rounds for bcrypt
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  return hashedPassword;
};

// Weak password function
const isWeakPassword = (password:string) => {
  const minLength = 8; // Minimum password length requirement
  return password.length < minLength;
};

const handleRegPassword = (req:any, res:any, next:any) => {
    if (req.body && req.body.password) {
      const password = req.body.password;
      // Add your logic to filter weak passwords
      if (isWeakPassword(password)) {
        return res.status(400).json({ message: 'Weak password' });
      }
  
      // Hash the password
      const hashedPassword = hashPassword(password); // Replace hashFunction with your actual hashing logic
  
      // Update the request body with the hashed password
      req.body.password = hashedPassword;
    }
  
    // Continue to the next middleware or route handler
    next();
  };

  export {
    handleRegPassword,
  }
  