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



export { isWeakPassword };
