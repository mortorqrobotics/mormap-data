var http = require("http");
var fs = require("fs");

var year = "2016";
var outputFile = "teams.json";

function request(path, cb) {
	http.request({
		host : "www.thebluealliance.com",
		path : "/api/v2" + path,
		headers : {"X-TBA-App-Id" : "frc1515:MorMap:1"}
	}, function(res) {
		var data = "";
		res.on("data", function(chunk) {
			data += chunk;
		});
		res.on("end", function() {
			cb(JSON.parse(data));
		});
	}).end();
};


request("/events/" + year, function(events) {
	var allTeams = {};
	var done = 0;
	for(var i = 0; i < events.length; i++) {
		var event = events[i];
		request("/event/" + event.key + "/teams", function(teams) {
			for(var j = 0; j < teams.length; j++) {
				var team = teams[j];
				if(!allTeams[team.team_number] && team.name && team.location) {
					allTeams[team.team_number] = {
						school: team.name.substring(team.name.lastIndexOf("&") + 1),
						location: team.location
					};
				}
			}
			done++;
			if(done == events.length) {
				fs.writeFile(outputFile, JSON.stringify(allTeams));
			}
		});
	}
});