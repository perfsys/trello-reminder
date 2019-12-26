'use strict';
const Trello = require("trello");
require("dotenv").config();

const apiKey = process.env.TRELLO_API_KEY;
const oauthToken = process.env.TRELLO_OAUTH_TOKEN;
const memberId = process.env.MEMBER_ID;

const trello = new Trello(apiKey, oauthToken);

const getBoards = async () => {
    let boardsArray = [];

    try {
        boardsArray = await trello.getBoards(memberId);
    } catch (error) {
        if (error) {
            console.log('error ', error);
        }
    }

    return boardsArray;
}

const getCardsArray = async (array) => {
    let boardId;
    let response = [];
    for (let i = 0; i < array.length; i++) {
        boardId = array[i].id
        try {
            let data = await trello.getCardsOnBoard(boardId);
            response.push(data)
        } catch (error) {
            if (error) {
                console.log('error ', error);
            }
        }
    }

    return response;
}

const checkName = async (array) => {
    let result = [];

    for (let i = 0; i < array.length; i++) {
        let match = array[i].name.match(/\| \d{1,3}[hm]/g);

        if (match) {
            let remindPeriod = match[0].split(' ');
            console.log(remindPeriod)
            let time = remindPeriod[1].match(/\d{1,3}/g)
            let period = remindPeriod[1].match(/[hm]/g)

            if (period[0] == "h") {
                time[0] = Number(time[0]) * 60;
            }
            let currentTime = new Date();
            let timeOfLastChange = new Date(array[i].dateLastActivity);
            let interval = Math.floor((currentTime - timeOfLastChange) / 1000 / 60)

            if (interval >= time[0]) {
                // console.log('make comment')
                await addComment(array[i].id, array[i].idMembers)
                result.push('make comment')
            } else {
                // console.log("don't make comment")
                result.push("don't make comment")
            }
        }
    }

    return result;
}

const addComment = async (cardId) => {
    let time = new Date(Date.now()).toLocaleString();

    try {
        await trello.addCommentToCard(cardId, `@ Follow up`);
    } catch (error) {
        if (error) {
            console.log('error ', error);
        }
    }
}

module.exports.runReminder = async (event, context) => {
    let boardArray = await getBoards();
    let cardsArray = await getCardsArray(boardArray);
    let itemArray = [];

    for (let i = 0; i < cardsArray.length; i++) {
        let data = await checkName(cardsArray[i]);

        if (data.length != 0) {
            itemArray.push(data);
        }
    }
};