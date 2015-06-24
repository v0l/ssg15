// Data that should be made available to every
// request and as such to handlebars as well
// Eg. logged in user name, id, etc
//====================================================

exports.globals = function(req, res, next) {
	res.locals.req = req;
    res.locals.global = {
    	test: "Test"
    };
    next();
};