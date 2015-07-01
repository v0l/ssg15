var fs = require('fs');

module.exports = JSON.parse(fs.readFileSync('tuning_data.json'));

module.exports.Calc = function(base, mul, exp, level){
	return parseFloat(base) * Math.pow(parseFloat(level) * parseFloat(mul),parseFloat(exp));
};

module.exports.CalcCost = function(base, exp, level)
{
	var c = base * Math.pow(exp, level);
	return Math.floor(c / 10) * 10;
};
