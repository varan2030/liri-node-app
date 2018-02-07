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
var category, title, userName;

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

//Input validation: User name

inquirer.prompt([

    {
        type: "input",
        name: "name",
        message: "What is your name???"
    }

]).then(function (user) {
    
    userName = user.name;

    if (userName){
        startRound ();
    }else{
        console.log('Please enter your name!!!');
    }
    
});

//Input validation by categories: "TWITTER", "MUSIC", "MOVIES", "RANDOM COMPUTER SELECTION" 
function startRound () {

    inquirer.prompt([
    {
        type: "list",
        name: "option",
        message: "Hi! My name is LIRI. Please select the following categories:",
        choices: ["TWITTER", "MUSIC", "MOVIES", "RANDOM COMPUTER SELECTION"]
    },

    ]).then(function (user) {
            
            selectCategory(user);
        
    });
}


// Run a function of the category that has been seleced
function selectCategory(user){
    if (user.option === "TWITTER") {
        fs.appendFile("log.txt", time + " USER: " + userName + " | CATEGORY: TWITTER \n", function (err) {
            if (err) {
                return console.log(err);
            }
        });
        showMyTweets();

    } else if (user.option === "MUSIC") {

        inquirer.prompt([
            {
                type: "input",
                name: "songName",
                message: "What is your favorite song, " + userName + "?"
            },
        ])
            .then(function (song) {

                if (!song.songName) {
                    song.songName = "The Sign Ace of Base";
                }
                fs.appendFile("log.txt", time + " USER: " + userName +
                    "| CATEGORY: Music | TITLE: " + song.songName + "\n", function (err) {

                        if (err) {
                            return console.log(err);
                        }

                    });
                showMySongs(song.songName);
            });

    } else if (user.option === "MOVIES") {
        inquirer.prompt([

            {
                type: "input",
                name: "movieName",
                message: "What is your favorite movie, " + userName + "?"
            },
        ]).then(function (movie) {

            if (!movie.movieName) {
                movieName = "Mr. Nobody";
            }
            fs.appendFile("log.txt", time + " USER: " + userName +
                "| CATEGORY: Movies | TITLE: " + movie.movieName + "\n", function (err) {

                    if (err) {
                        return console.log(err);
                    }
                });
            showMyMovies(movie.movieName);
        });

    } else if (user.option === "RANDOM COMPUTER SELECTION") {
        randomSelect(userName);
    }
}

// Twitter request
function showMyTweets() {
    console.log("**********************************************");
    console.log("My tweets: ")
    client.get('search/tweets', { q: 'Varan52587035', count: 20 }, function (err, data, response) {
        for (i = 18; i >= 0; i--) {
            console.log((19 - i) + ". " + data.statuses[i].text);
        }
    })
    console.log("**********************************************");
};

//Spotify request
function showMySongs(song) {

    spotify.search({ type: 'track', query: song }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        console.log("**********************************************");
        console.log("Artist(s): " + data.tracks.items[0].artists[0].name);
        console.log("Song's name: " + data.tracks.items[0].name);
        console.log("Preview link: " + data.tracks.items[0].preview_url);
        console.log('Album: 😎  ' + data.tracks.items[0].album.name);
        console.log("**********************************************");
    });
}

//OMDB request
function showMyMovies(movie) {

    omdb.byId({
        title: movie,
        imdb: 'tt0485947',
        type: 'movie',
        plot: 'full',
        tomatoes: true,
    }).then(function (res) {
        console.log("**********************************************");
        console.log("Title: " + res.Title);
        console.log("Year: " + res.Year);
        console.log("imdbRating: " + res.imdbRating);
        console.log("tomatoRotten:  " + res.tomatoRotten);
        console.log("Country: " + res.Country);
        console.log("Language: " + res.Language);
        console.log("Plot: " + res.Plot);
        console.log("Actors: " + res.Actors);
        console.log("**********************************************");

    })
        .catch(err => console.error(err))
}

//Random selection

function randomSelect() {

    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");

        var randomNumber = Math.floor(Math.random() * 3 + 1);

        if (randomNumber === 1) {
            console.log('TWITER category has been selected!!!');
            console.log("\n**********************************************");
            category = dataArr[0];
            showMyTweets();
        } else if (randomNumber === 2) {
            console.log('MUSIC category has been selected!!!');
            console.log("\n**********************************************");
            category = dataArr[1];
            title = dataArr[2];
            showMySongs(title);
        } else {
            console.log('MOVIE category has been selected!!!');
            console.log("\n**********************************************");
            category = dataArr[3];
            title = dataArr[4];
            showMyMovies(title);
        }

        fs.appendFile("log.txt", time + " USER: " + userName +
            " | CATEGORY: Random | COMPUTER SELECTED CATEGORY: " + category + " | TITLE: " + title + "\n", function (err) {

                if (err) {
                    return console.log(err);
                }
            });
    });

}