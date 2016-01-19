# MorMap
An application to help FRC teams find other teams near them. Try it out [here](http://thevoidpigeon.heliohost.org/mormap/).

## Usage

MorMap uses node.js to compile a list of team locations with the help of [The Blue Alliance](http://thebluealliance.com/) and Google Maps. To do this, run `node getTeams.js` to compile a list of teams participating in any regional in 2016 with a location provided by The Blue Alliance. Then, run `node getLocations.js` to start compiling longitude and latitude for each team. This will take a long time, and if the process crashes due to something like an internet disconnection, restart it and it will pick up where it left off. In order to regenerate the team location database after already having it generated, delete the `locations.js` file. This repository includes a pregenerated copy of the database. After all team locations have been retrieved, run `node finalize.js` to finalize the database. The map of teams can then be viewed by opening `index.html` in a web browser. The html file only relies on `locations.js` to work correctly.

## Accuracy

MorMap is not completely accurate, as it relies on the school name from The Blue Alliance to find the exact location of a team. The location of some teams is accurate only to the city, and other teams that are participating in a regional in 2016 are not included since the search on Google Maps yielded no results. There are plans to add manual corrections to the database for the ~190 teams not included in MorMap.
