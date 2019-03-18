"use strict";

const requestPromise = require("request-promise");

module.exports = class MatrixRestClient {
    constructor() {
        this._baseUrl = "https://scicat03.esss.lu.se:8448";
        this._accessToken =
            "MDAyMWxvY2F0aW9uIHNjaWNhdDAzLmVzc3MubHUuc2UKMDAxM2lkZW50aWZpZXIga2V5CjAwMTBjaWQgZ2VuID0gMQowMDMxY2lkIHVzZXJfaWQgPSBAc2NpY2F0Ym90OnNjaWNhdDAzLmVzc3MubHUuc2UKMDAxNmNpZCB0eXBlID0gYWNjZXNzCjAwMjFjaWQgbm9uY2UgPSBYd3FfK255aTJ0MkxRNTFFCjAwMmZzaWduYXR1cmUguizglHUUiO27I-n2t2uKpeWtt3loaTsV9Gj-pzoOrNgK";
        this._userId = "@scicatbot:scicat03.esss.lu.se";
        this._txnCounter = 0;
    }

    createRoom({ visibility, room_alias_name, name, topic }) {
        let options = {
            method: "POST",
            uri: this._baseUrl + "/_matrix/client/r0/createRoom",
            headers: {
                Authorization: "Bearer " + this._accessToken
            },
            body: {
                visibility: visibility,
                room_alias_name: room_alias_name,
                name: name,
                topic: topic,
                creation_content: {
                    "m.federate": false
                }
            },
            rejectUnauthorized: false,
            json: true
        };

        return requestPromise(options).catch(err => {
            console.error("Error in createRoom(): " + err);
        });
    }

    findAllRooms() {
        let options = {
            method: "GET",
            uri: this._baseUrl + "/_matrix/client/r0/publicRooms",
            headers: {
                Authorization: "Bearer " + this._accessToken
            },
            rejectUnauthorized: false,
            json: true
        };

        return requestPromise(options)
            .then(response => {
                return new Promise((resolve, reject) => {
                    resolve(response.chunk);
                });
            })
            .catch(err => {
                console.error("Error in findAllRooms(): " + err);
            });
    }

    findRoomByName(requestName) {
        return this.findAllRooms()
            .then(allRooms => {
                let foundRoom;
                allRooms.forEach(room => {
                    if (room.name.toLowerCase() === requestName.toLowerCase()) {
                        foundRoom = room;
                    }
                });
                return new Promise((resolve, reject) => {
                    resolve(foundRoom);
                });
            })
            .catch(err => {
                console.error("Error in findRoomByName(): " + err);
            });
    }

    findRoomMembers(roomName) {
        return this.findRoomByName(roomName).then(room => {
            let options = {
                method: "GET",
                uri:
                    this._baseUrl +
                    `/_matrix/client/r0/rooms/${room.room_id}/members`,
                headers: {
                    Authorization: "Bearer " + this._accessToken
                },
                rejectUnauthorized: false,
                json: true
            };

            return requestPromise(options)
                .then(members => {
                    return new Promise((resolve, reject) => {
                        resolve(members.chunk);
                    });
                })
                .catch(err => {
                    console.error("Error in findRoomMemebers(): " + err);
                });
        });
    }

    sendMessageToRoom({ roomName, message }) {
        let txnId = this.newTxnId();
        return this.findRoomByName(roomName)
            .then(room => {
                let options = {
                    method: "PUT",
                    uri:
                        this._baseUrl +
                        `/_matrix/client/r0/rooms/${
                            room.room_id
                        }/send/m.room.message/${txnId}`,
                    headers: {
                        Authorization: "Bearer " + this._accessToken
                    },
                    body: {
                        body: message,
                        msgtype: "m.text"
                    },
                    rejectUnauthorized: false,
                    json: true
                };
                return requestPromise(options);
            })
            .catch(err => {
                console.error("Error in sendMessageToRoom(): " + err);
            });
    }

    findEventsByRoom(roomName) {
        let roomId;
        return this.findRoomByName(roomName)
            .then(room => {
                roomId = room.room_id;
                return this.sync();
            })
            .then(syncResponse => {
                let syncRoomIds = Object.keys(syncResponse.rooms.join);
                let roomEvents = {};
                syncRoomIds.forEach(syncRoomId => {
                    if (syncRoomId === roomId) {
                        roomEvents.roomId = roomId;
                        roomEvents.events =
                            syncResponse.rooms.join[roomId].timeline.events;
                    }
                });
                return new Promise((resolve, reject) => {
                    resolve(roomEvents);
                });
            })
            .catch(err => {
                console.error("Error in findEventsByRoom(): " + err);
            });
    }

    findMessagesByRoom(roomName) {
        return this.findEventsByRoom(roomName)
            .then(roomEvents => {
                let messages = [];
                roomEvents.events.forEach(event => {
                    if (this.eventTypeIsMessage(event)) {
                        messages.push(event);
                    }
                });
                return new Promise((resolve, reject) => {
                    resolve(messages);
                });
            })
            .catch(err => {
                console.error("Error in findMessagesByRoom(): " + err);
            });
    }

    findMessagesByRoomAndDate(roomName, date) {
        return this.findEventsByRoom(roomName)
            .then(roomEvents => {
                let messages = [];
                roomEvents.events.forEach(event => {
                    if (
                        this.eventTypeIsMessage(event) &&
                        this.eventDateEqualsRequestDate(event, date)
                    ) {
                        messages.push(event);
                    }
                });
                return new Promise((resolve, reject) => {
                    resolve(messages);
                });
            })
            .catch(err => {
                console.error("Error in findMessagesByRoomAndDate(): " + err);
            });
    }

    findMessagesByRoomAndDateRange(roomName, startDate, endDate) {
        return this.findEventsByRoom(roomName)
            .then(roomEvents => {
                let messages = [];
                roomEvents.events.forEach(event => {
                    if (
                        this.eventTypeIsMessage(event) &&
                        this.eventDateIsBetweenRequestDates(
                            event,
                            startDate,
                            endDate
                        )
                    ) {
                        messages.push(event);
                    }
                });
                return new Promise((resolve, reject) => {
                    resolve(messages);
                });
            })
            .catch(err => {
                console.error(
                    "Error in findMessagesByRoomAndDateRange()" + err
                );
            });
    }

    findImageByRoomAndFilename(roomName, filename) {
        return this.findMessagesByRoom(roomName).then(messages => {
            messages.forEach(message => {
                if (
                    this.messageTypeisImage(message) &&
                    this.messageBodyEqualsFilename(message, filename)
                ) {
                    let serverName = message.content.url.split(/\/+/)[1];
                    let mediaId = message.content.url.split(/\/+/)[2];

                    let options = {
                        method: "GET",
                        uri:
                            this._baseUrl +
                            `/_matrix/media/r0/download/${serverName}/${mediaId}`,
                        headers: {
                            Authorization: "Bearer " + this._accessToken
                        },
                        rejectUnauthorized: false
                    };
                    return requestPromise(options).catch(err => {
                        console.log(
                            "Error in findImageByRoomAndFilename(): " + err
                        );
                    });
                }
            });
        });
    }

    eventTypeIsMessage(event) {
        if (event.type === "m.room.message") {
            return true;
        } else {
            return false;
        }
    }

    messageTypeisImage(message) {
        if (message.content.msgtype === "m.image") {
            return true;
        } else {
            return false;
        }
    }

    messageBodyEqualsFilename(message, filename) {
        if (message.content.body.toLowerCase() === filename.toLowerCase()) {
            return true;
        } else {
            return false;
        }
    }

    eventDateEqualsRequestDate(event, date) {
        let messageTimeStamp = new Date(event.origin_server_ts);
        messageTimeStamp.setUTCHours(0, 0, 0, 0);
        let requestDate = new Date(date);
        if (messageTimeStamp.getTime() === requestDate.getTime()) {
            return true;
        } else {
            return false;
        }
    }

    eventDateIsBetweenRequestDates(event, startDate, endDate) {
        let messageTimeStamp = new Date(event.origin_server_ts);
        messageTimeStamp.setUTCHours(0, 0, 0, 0);
        let requestStartDate = new Date(startDate);
        let requestEndDate = new Date(endDate);
        if (
            messageTimeStamp.getTime() > requestStartDate.getTime() &&
            messageTimeStamp.getTime() < requestEndDate.getTime()
        ) {
            return true;
        } else {
            return false;
        }
    }

    printFormattedMessages(messages) {
        messages.forEach(message => {
            let messageTimeStamp = new Date(message.origin_server_ts)
                .toISOString()
                .replace("T", " ")
                .replace(/\.\w+/, "");
            console.log(
                `[${messageTimeStamp}] ${message.sender} >>> ${
                    message.content.body
                }`
            );
        });
    }

    login() {
        let options = {
            method: "POST",
            uri: this._baseUrl + "/_matrix/client/r0/login",
            body: {
                type: "m.login.password",
                identifier: {
                    type: "m.id.user",
                    user: this._userId
                },
                password: this._password
            },
            rejectUnauthorized: false,
            json: true
        };

        return requestPromise(options).catch(err => {
            console.error("Error in login(): " + err);
        });
    }

    whoAmI() {
        let options = {
            method: "GET",
            uri: this._baseUrl + "/_matrix/client/r0/account/whoami",
            headers: {
                Authorization: "Bearer " + this._accessToken
            },
            body: {
                timeout: 5000
            },
            rejectUnauthorized: false,
            json: true
        };

        return requestPromise(options).catch(err => {
            console.error("Error in whoAmI(): " + err);
        });
    }

    findUserInfoByUserName(userName) {
        let userId = "@" + userName.toLowerCase() + ":scicat03.esss.lu.se";
        let options = {
            method: "GET",
            uri: this._baseUrl + `/_matrix/client/r0/profile/${userId}`,
            headers: {
                Authorization: "Bearer " + this._accessToken
            },
            rejectUnauthorized: false,
            json: true
        };

        return requestPromise(options).catch(err => {
            console.error("Error in findUserInfoByUserId(): " + err);
        });
    }

    sync() {
        console.log("Syncing...");
        let options = {
            method: "GET",
            uri: this._baseUrl + "/_matrix/client/r0/sync",
            headers: {
                Authorization: "Bearer " + this._accessToken
            },
            body: {
                full_state: true,
                timeout: 5000
            },
            rejectUnauthorized: false,
            json: true
        };

        return requestPromise(options)
            .then(response => {
                console.log("Sync succesful");
                return new Promise((resolve, reject) => {
                    resolve(response);
                });
            })
            .catch(err => {
                console.error("Error in sync(): " + err);
            });
    }

    newTxnId() {
        return "s" + new Date().getTime() + "." + this._txnCounter++;
    }
};
