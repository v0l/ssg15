// Handlebar helpers go here
//=======================================

exports.Honk = function(context, options) {
	console.log("HONK");
  	return "Honk Honk <br><img src='http://booru.ehkzai.com/index.php?q=/image/7063.jpg'/>";
};

// Allow pages to add extra stuff to the head section of the template
exports.ExtraHead = function(context, options) {
	context.data.root.global.Head2 = context.fn(this);

  	return "";
};
