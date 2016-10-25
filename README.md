# MorMap
An application to help FRC teams find other teams near them. Try the demo [here](http://mortorqrobotics.github.io/mormap-data).

## Accuracy

MorMap currently only includes teams that participated in at least one competition in 2016. It will be updated for 2017 soon.

MorMap uses the team location and school name provided by The Blue Alliance to obtain precise locations so that teams that are close to each other can accurately judge distance and collaborate more easily. It falls back to just using the city if the school name is not found by Google.

## Usage

To generate the data, MorMap requires node and npm. Start by running `npm install` to install dependencies and set up files.

MorMap uses [The Blue Alliance](http://thebluealliance.com/) and the [Google Places API Web Service](https://developers.google.com/places/web-service/). In order to generate the data, enter the Google API key in `config.json`.

Then, run `npm start` to begin generating data.

Depending on your Google API key rate limits, it might take multiple days to complete the data collection. If you hit the limit, the script will terminate and you can restart it later. The script can be stopped at any time and it will pick up where it left off, as all requests are saved locally after they are made once.

The resulting `locations.js` can be used as JSONP for websites or as a module for NodeJS/browserify/etc.

