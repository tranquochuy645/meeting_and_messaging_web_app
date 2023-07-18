import bcrypt from 'bcrypt';
// Weak password function
const isWeakPassword = (password: string) => {
  const minLength = 8; // Minimum password length requirement
  const uppercaseRegex = /[A-Z]/; // Regex to match uppercase letters
  const lowercaseRegex = /[a-z]/; // Regex to match lowercase letters
  const numberRegex = /[0-9]/; // Regex to match numbers

  // Check if the password meets the required criteria
  return (
    password.length < minLength ||
    !uppercaseRegex.test(password) ||
    !lowercaseRegex.test(password) ||
    !numberRegex.test(password)
  );
};

const handleRegPassword = (req: any, res: any, next: any) => {
  if (req?.body?.password) {
    const password = req.body.password;
    if (isWeakPassword(password)) {
      return res.status(422).json({ message: "Weak Password" })
    }
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
  handleRegPassword
}
