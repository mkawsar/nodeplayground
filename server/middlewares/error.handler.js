
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found : ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Error Handler
export const errorHander = (err, req, res, next) => {
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    req.status(statusCode);
    res.json({
        message: err?.message,
        stack: err?.statck
    });
};