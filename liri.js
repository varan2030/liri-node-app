require("dotenv").config();
var keys = require("./keys.js");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var OmdbApi = require('omdb-api-pt');
var inquirer = require("inquirer");
var fs = require("fs");

var option = process.argv;
var spotify = keys.spotify;
var client = keys.twitter;
var omdb = keys.omdb;
var time = new Date();
var category = "";
var title = "";

var client = new Twitter({
    consumer_key: client.consumer_key,
    consumer_secret: client.consumer_secret,
    access_token_key: client.access_token_key,
    access_token_secret: client.access_token_secret
});

var spotify = new Spotify({
    id: spotify.id,
    secret: spotify.secret
});

var omdb = new OmdbApi({
    apiKey: omdb.apiKey,
    baseUrl: 'https://omdbapi.com/'
})

inquirer.prompt([

    {
        type: "input",
        name: "name",
        message: "What is your name???"
    },

    {
        type: "list",
        name: "option",
        message: "Hi! My name is LIRI. Please select the following categories:",
        choices: ["TWEETER", "MUSIC", "MOVIES", "RANDOM COMPUTER SELECTION"]
    },


]).then(function (user) {
    
    if (user.name){
        selectCategory(user);
    }else{
        console.log('Please type your name!!!');
    }
    
});

function selectCategory(user){
    if (user.option === "TWEETER") {
        fs.appendFile("log.txt", time + " USER: " + user.name + " | CATEGORY: TWEETER \n", function (err) {
            if (err) {
                return console.log(err);
            }
        });
        showMyTweets(user);

    } else if (user.option === "MUSIC") {

        inquirer.prompt([
            {
                type: "input",
                name: "songName",
                message: "What is your favorite song, " + user.name + "?"
            },
        ])
            .then(function (song) {

                if (!song.songName) {
                    song.songName = "The Sign Ace of Base";
                }
                fs.appendFile("log.txt", time + " USER: " + user.name +
                    "| CATEGORY: Music | TITLE: " + song.songName + "\n", function (err) {

                        if (err) {
                            return console.log(err);
                        }

                    });
                showMySongs(user, song.songName);
            });

    } else if (user.option === "MOVIES") {
        inquirer.prompt([

            {
                type: "input",
                name: "movieName",
                message: "What is your favorite movie, " + user.name + "?"
            },
        ]).then(function (movie) {

            if (!movie.movieName) {
                movieName = "Mr. Nobody";
            }
            fs.appendFile("log.txt", time + " USER: " + user.name +
                "| CATEGORY: Movies | TITLE: " + movie.movieName + "\n", function (err) {

                    if (err) {
                        return console.log(err);
                    }
                });
            showMyMovies(user, movie.movieName);
        });

    } else if (user.option === "RANDOM COMPUTER SELECTION") {
        randomSelect(user.name);
    }
}
function showMyTweets(user) {
    console.log("My tweets: ")
    client.get('search/tweets', { q: 'Varan52587035', count: 20 }, function (err, data, response) {
        for (i = 18; i >= 0; i--) {
            console.log((19 - i) + ". " + data.statuses[i].text);
        }
    })
};

function showMySongs(user, song) {

    spotify.search({ type: 'track', query: song }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        console.log("Artist(s): " + data.tracks.items[0].artists[0].name);
        console.log("Song's name: " + data.tracks.items[0].name);
        console.log("Preview link: " + data.tracks.items[0].preview_url);
        console.log('Album: 😎  ' + data.tracks.items[0].album.name);
    });
}

function showMyMovies(user, movie) {

    omdb.byId({
        title: movie,
        imdb: 'tt0485947',
        type: 'movie',
        plot: 'full',
        tomatoes: true,
    }).then(function (res) {
        console.log("Title: " + res.Title);
        console.log("Year: " + res.Year);
        console.log("imdbRating: " + res.imdbRating);
        console.log("tomatoRotten:  " + res.tomatoRotten);
        console.log("Country: " + res.Country);
        console.log("Language: " + res.Language);
        console.log("Plot: " + res.Plot);
        console.log("Actors: " + res.Actors);

    })
        .catch(err => console.error(err))
}

function randomSelect(user) {

    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");

        var randomNumber = Math.floor(Math.random() * 3 + 1);

        if (randomNumber === 1) {
            console.log('TWITER category has been selected!!!');
            category = dataArr[0];
            showMyTweets(user);
        } else if (randomNumber === 2) {
            console.log('MUSIC category has been selected!!!');
            category = dataArr[1];
            title = dataArr[2];
            showMySongs(user, title);
        } else {
            console.log('MOVIE category has been selected!!!');
            category = dataArr[3];
            title = dataArr[4];
            showMyMovies(user, title);
        }

        fs.appendFile("log.txt", time + " USER: " + user +
            " | CATEGORY: Random | COMPUTER SELECTED CATEGORY: " + category + " | TITLE: " + title + "\n", function (err) {

                if (err) {
                    return console.log(err);
                }
            });
    });

}