const fetch = require('node-fetch'); // fetchs websites
const schemas = require('../schemas/schema'); // schemas
const mongoose = require('mongoose') // for accesing databse;
const serverName = process.env['SERVERNAME'] || 'http://localhost:5832/';

// Connect to mongodb database
const dbURI = "mongodb+srv://lavishRoot:qq2nMOUee49oEjOr@lavish-anime-manga-logi.nclfo.mongodb.net/manga-anime-hold?retryWrites=true&w=majority";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

// to use .env files
require('dotenv').config();

// for notifications setup
const webpush = require('web-push');

const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

webpush.setVapidDetails('mailto:lavishk750@gmail.com', publicKey, privateKey);

// delete invlaid subscriptions
async function deleteInvalid(subscription) {
    await schemas.subscription.findOneAndRemove({
        'subscription': subscription
    })
    console.log('deleted');
}

async function sendNotification(subscription, manga) {
    //console.log(subscription.subscription[0])
    //https://temp.compsci88.com/cover/${manga.IndexName}.jpg
    //Create Payload for notifications
    const payload = JSON.stringify({
        'title': `New ${manga.SeriesName} ${manga.Chapters[0].Type} ${manga.Chapters[0].Chapter} !! ^_^`,
        'body': '',
        'img': `https://temp.compsci88.com/cover/${manga.IndexName}.jpg`
    });

    // Notfiy the user that they have been subscribed
    webpush.sendNotification(subscription, payload).catch(err => {
        console.log(err.statusCode)
        // meaning that subscription is invlaid and should be deleted
        if (err.statusCode == 410 || err.statusCode == 404) {
            deleteInvalid(subscription);
        }
    });
}

async function findSubscriptions(manga) {
    console.log('finding subsccriptions')
    // get users with a speficic bookmark
    let user = await schemas.USERS.find({
        'subscribed.Index': manga.IndexName
    });
    // for each user find their corresponding subscription
    for (var j = 0; j < user.length; j++) {
        console.log(user[j].name, user[j].id);
        let subscriptions = await schemas.subscription.find({
            'user.userName': user[j].name,
            'user.userId': user[j].id
        })

        // for each subscriptions send the notifications
        for (var k = 0; k < subscriptions.length; k++) {
            console.log(subscriptions[k].subscription[0]);
            sendNotification(subscriptions[k].subscription[0], manga)
        }
    }
}

async function fetchManga(manga) {
    let link = serverName + 'api/mangaName?manga=' + manga;
    console.log(link);
    // fetch the data
    try {
        let fetchAllData = await fetch(link);
        let resp = await fetchAllData.json();
        return resp;
    } catch (err) {
        console.log(err);
    }
    return;
}

async function main() {
    var subbedManga = (await schemas.subbedManga.findOne()).subbed;
    //subbedManga = ['Jujutsu-Kaisen','Suppose-a-Kid-from-the-Last-Dungeon-Boonies-Moved-to-a-Starter-Town'];
    for (var i = 0; i < subbedManga.length; i++) {
        // setting a timeout so we don't get deteced as bots doing like 50 requests at a time
        let resp = await fetchManga(subbedManga[i]);
        console.log('recevied')
        try {
            if (resp.Chapters[0].isNew) {
                await findSubscriptions(resp)
            }
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    main
}