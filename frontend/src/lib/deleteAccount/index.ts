export const deleteAccount = (token: string) => {
    return new Promise(
        async (resolve, reject) => {
            const confirmed = window.confirm("Are you sure you want to delete your account?");
            if (!confirmed) return reject("Account deletion canceled");

            const password = window.prompt("Enter your password:");

            if (!password) return reject("Password input canceled");

            try {
                const body = { password };
                const response = await fetch(`/api/v1/users/`, {
                    method: "DELETE",
                    headers: {
                        "content-type": "application/json",
                        authorization: "Bearer " + token,
                    },
                    body: JSON.stringify(body),
                });

                if (response.ok) {
                    sessionStorage.removeItem("token");
                    return resolve("Account deletion successful");
                }
                const data = await response.json();
                if (data.message) return reject(data.message);
                reject("Wrong password");

            } catch (error) {
                reject(error);
            }
        }
    );
};
