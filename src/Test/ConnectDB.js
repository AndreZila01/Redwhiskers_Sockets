const mongoose = require('mongoose');



async function load() {


    var s = await mongoose.connect('mongodb://root:gizmov-cavdob-nanQo7@127.0.0.1:21017/whiskers',
        {
            authSource: "admin",
        }
    ).then(
        () => {
            console.log("Connected to MongoDB");
        },
        err => {
            console.error(err);
        }
    );
    await mongoose.connect('mongodb://root:gizmov-cavdob-nanQo7@127.0.0.1:21017/whiskers');
    console.log("Connected to MongoDB");

    console.log("Creating Schema");
    var s = mongoose.model(`User`, {
        username: String, email: String, inventory: Array, panda: Array, scores: Array, powerUpStats: Array, questProgress: Array
    });

    console.log("Creating User");
    (new s({ username: "Andre", email: "@", inventory: [], panda: [], scores: [], powerUpStats: [], questProgress: [] })).save();

    console.log("Waiting 5 seconds");
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Finding User");
    const value = await s.findOne({ username: "Andre" }).exec();
    console.log("User found:", value);
}

load();