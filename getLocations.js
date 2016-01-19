var https = require("https");
var fs = require("fs");

var inputFile = "teams.json";
var outputFile = "locations.js";
var delay = 300;

var back = String.fromCharCode(8);
for(var i = 0; i < 4; i++) {
	back = back + back;
}

if(!fs.existsSync(outputFile)) {
	fs.writeFile(outputFile, "", "utf-8");
}
var teams = JSON.parse(fs.readFileSync(inputFile));
var previous = fs.readFileSync(outputFile).toString();
var teamNums = Object.keys(teams);

var i = 0;
var interval = setInterval(function() {
	while(previous.indexOf('"' + teamNums[i] + '"') != -1 && i < teamNums.length) {
		i++;
	}
	if(i >= teamNums.length) {
		clearInterval(interval);
		return;
	}
	var index = i;
	getLocationInfo(teams[teamNums[i]], function(coords) {
		process.stdout.write(back + index + "/" + teamNums.length);
		if("0123456789-".indexOf(coords.charAt(0)) != -1) {
			fs.appendFile(outputFile, '"' + teamNums[index] + '":"' + coords + '",', "utf-8");
		}
	});
	i++;
}, delay);

function getLocationInfo(team, cb) {
	https.request({
		host : "www.google.com",
		path : "/maps/search/" + encodeURIComponent((team.school + ", " + team.location).replace(/ /g, "+")) + "?dg=dbrw&newdg=1"
	}, function(res) {
		var data = "";
		res.on("data", function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
			var str = data.toString();
			var index1 = str.indexOf("[[52]]]");
			var index2 = str.indexOf('","', index1);
			var index3 = str.indexOf('"', index2 + 3);
			//var address = str.substring(index2 + 3, index3);
			var index4 = str.indexOf("]", index3 + 1);
			var coords = str.substring(index3 + 3, index4);
			cb(coords);
		});
	}).end();
}