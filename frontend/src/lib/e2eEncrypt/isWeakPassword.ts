// Weak password function
const isWeakPassword = (password: string) => {
    const minLength = 6; // Minimum password length requirement
    const uppercaseRegex = /[A-Z]/; // Regex to match uppercase letters
    const lowercaseRegex = /[a-z]/; // Regex to match lowercase letters

    // Check if the password meets the required criteria
    return (
        password.length < minLength ||
        !uppercaseRegex.test(password) ||
        !lowercaseRegex.test(password)
    );
};



export { isWeakPassword };
