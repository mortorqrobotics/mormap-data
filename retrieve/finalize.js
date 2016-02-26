var fs = require("fs");

var file = "locations.js";

var str = fs.readFileSync(file).toString();

var teams = JSON.parse("{" + str.substring(0, str.length - 1) + "}");

for(var i in teams) {
	var split = teams[i].split(",");
	teams[i] = {
		longitude: parseFloat(split[0]),
		latitude: parseFloat(split[1])
	};
}

fs.writeFile(file, "var data = " + JSON.stringify(teams) + ";", "utf-8");