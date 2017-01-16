"use strict";

const Promise = require("bluebird");
const request = require("request-promise");
const fs = require("fs.promised/promisify")(Promise);
const coroutine = Promise.coroutine;

const config = require("./config.json");
const outputFileJsonp = "locations.js";
const outputFileJson = "locations.json";
const year = 2016;

const delay = (millis) => new Promise(resolve => setTimeout(resolve, millis));
const getPath = (path) => require("path").join(__dirname, path);

const checkCache = coroutine(function*(path, noCache) {
    if (yield fs.exists(path)) {
        return (yield fs.readFile(path)).toString();
    } else {
        try {
            let result = yield noCache();
            yield fs.writeFile(path, result);
            return result;
        } catch (err) {
            console.log();
            console.error(err);
            process.exit(1);
        }
    }
});

const searchMaps = coroutine(function*(query) {
    query = encodeURIComponent(query);
    let file = getPath("cache/google/" + query.replace(/\s+/g, "+")
        .replace(/\//g, "-"));
    let result;
    let cached = yield checkCache(file, coroutine(function*() {
        let url = "https://maps.googleapis.com/maps/api/place/textsearch/json?key="
            + config.googlePlacesApiWebServiceKey + "&query=" + query;
        let resultStr = yield request(url);
        result = JSON.parse(resultStr);
        if (result.error_message) {
            throw result;
        }
        return resultStr;
    }));
    return result || JSON.parse(cached); // to avoid parsing twice if not necessary
});

const searchTba = coroutine(function*(path) {
    let file = getPath("cache/tba/" + path.slice(1).replace(/\//g, "-"));
    return JSON.parse(yield checkCache(file, coroutine(function*() {
        return yield request({
            uri: "http://www.thebluealliance.com/api/v2" + path,
            headers: { "X-TBA-App-Id": "frc1515:MorMap:2" },
        });
    })));
});

coroutine(function*() {
    let events = yield searchTba("/events/" + year);
    let allTeams = {};
    let teamss = yield Promise.all(events.map(event => (
        searchTba("/event/" + event.key + "/teams")
    )));
    for (let teams of teamss) {
        for (let team of teams) {
            if (!allTeams[team.team_number] && team.name && team.location) {
                allTeams[team.team_number] = {
                    school: team.name.substring(team.name.lastIndexOf("&") + 1).trim(),
                    location: team.location,
                };
            }
        }
    }
    let teamNums = Object.keys(allTeams);
    let locationsArr = [];
    let index = 0;
    for (let teamNum of teamNums) {
        let query = allTeams[teamNum].school + " in " + allTeams[teamNum].location;
        let result = yield searchMaps(query);
        if (result.results[0]) {
            locationsArr.push({
                status: "exact",
                data: result.results[0],
            });
        } else {
            let location = allTeams[teamNum].location;
            query = location;
            result = yield searchMaps(query);
            if (result.results[0]) {
                locationsArr.push({
                    status: "city",
                    data: result.results[0],
                });
            } else {
                // console.log(teamNum)
                let city = location.match(/^([^,]+),/)[1].replace(/\([^\)]*\)/g, "");
                let country = location.match(/(,[^,]+)$/)[1];
                query = city + country;
                result = yield searchMaps(query);
                if (result.results[0]) {
                    locationsArr.push({
                        status: "nostate",
                        data: result.results[0],
                    });
                } else {
                    locationsArr.push({
                        status: "fail",
                    });
                }
            }
        }
        process.stdout.write("\r" + index + "/" + teamNums.length);
        index++;
    }
    let locationsObj = {};
    for (let i = 0; i < teamNums.length; i++) {
        let result = locationsArr[i];
        if (result.status !== "fail") {
            locationsObj[teamNums[i]] = result.data.geometry.location;
        }
    }
    // for usage as jsonp and in node
    let begin = "(function() {\nvar locations = ";
    let end = ";"
        + "\nif (typeof module === 'undefined') { window.teamLocations = locations; }"
        + "\nelse { module.exports = locations; }"
        + "\n})();";
    yield fs.writeFile(getPath(outputFileJsonp),
        begin + JSON.stringify(locationsObj) + end
    );
    yield fs.writeFile(getPath(outputFileJson), JSON.stringify(locationsObj));
    console.log("\rdone         ");
})();
