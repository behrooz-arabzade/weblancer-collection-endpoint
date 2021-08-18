module.exports.unlessRoute = function unlessRoute (path, middleware) {
    return function(req, res, next) {
        if (path.includes(req.url)) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};
