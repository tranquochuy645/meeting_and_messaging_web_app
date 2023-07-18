const filterJsonError = (err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError) {
        res.status(400).send({ status: 400, message: err.message }); // Bad json
    } else {
        next();
    }
}
export {
    filterJsonError
}