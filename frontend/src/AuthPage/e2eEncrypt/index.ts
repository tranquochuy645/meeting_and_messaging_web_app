import { SHA256 } from 'crypto-js';

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

const handleInputPassword = (inputPassword: string, check: boolean = true) => {
    if (check && isWeakPassword(inputPassword)) {
        throw new Error('Weak password. Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.');
    }

    // Hash the password using SHA-256
    return SHA256(inputPassword).toString();
};

export { handleInputPassword };
