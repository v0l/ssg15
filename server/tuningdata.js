var fs = require('fs');

module.exports = JSON.parse(fs.readFileSync('tuning_data.json'));

module.exports.Calc = function(base, mul, exp, level){
	return parseFloat(base) * Math.pow(parseFloat(level) * parseFloat(mul),parseFloat(exp));
}

module.exports.FloorOf = function( multipleOf, number )
{
	return Math.floor( number / multipleOf ) * multipleOf;
}
