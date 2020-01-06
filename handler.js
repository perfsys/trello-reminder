'use strict';
const Trello = require("trello");

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

const getListsArray = async (array) => {
    let boardId;
    let response = [];
    for (let i = 0; i < array.length; i++) {
        boardId = array[i].id
        try {
            let data = await trello.getListsOnBoard(boardId);
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
    for (let i = 0; i < array.length; i++) {
        console.log("List name: " + array[i]);
        try {
            let match = array[i].name.match(/\| \d{1,3}[hm]/g);
            if (match) {
                let remindPeriod = match[0].split(' ');
                console.log(remindPeriod)
                let time = remindPeriod[1].match(/\d{1,3}/g)
                let period = remindPeriod[1].match(/[hm]/g)
                let cards = await getCardsOfList(array[i].id)

                if (period[0] === "h") {
                    time[0] = Number(time[0]) * 60;
                }

                let currentTime = new Date();

                for (let j = 0; j < cards.length; j++) {
                    let timeOfLastChange = new Date(cards[j].dateLastActivity);
                    let interval = Math.floor((currentTime - timeOfLastChange) / 1000 / 60)
                    if (interval >= time[0]) {
                        await addComment(cards[j].id, cards[j].idMembers)
                        console.log('make comment')
                    } else {
                        console.log("don't make comment")
                    }
                }
            }
        } catch (e) {
            console.log(e)
            console.log("Can't update the list: " + array[i])
        }
    }

}

const getCardsOfList = async (listId) => {
    let response = [];
    try {
        response = await trello.getCardsOnList(listId);
    } catch (error) {
        if (error) {
            console.log('error ', error);
        }
    }

    return response;
}

const addComment = async (cardId) => {

    try {
        await trello.addCommentToCard(cardId, `Update me`);
    } catch (error) {
        if (error) {
            console.log('error ', error);
        }
    }
}


module.exports.runReminder = async (event, context) => {
    let boardArray = await getBoards(memberId);
    let listsArray = await getListsArray(boardArray);

    for (let i = 0; i < listsArray.length; i++) {
        await checkName(listsArray[i]);
    }
};