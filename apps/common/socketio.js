module.exports = function (io) {

    var db_model = require('../models/db_models');
    var data_table = 'app_users';

    var USERSDATA = [];

    var CUSTOMERSDATA = [];

    io.sockets.on("connection", function (socket) {
        console.log("Có thằng vừa truy cập! ID = " + socket.id);

        socket.on("GET-USERDATA", data => {
            socket.emit('EMIT-USERSDATA', USERSDATA);
        });

        //LISTEN ON USER ACTIONS
        socket.on("user-login", data => {
            console.log(data.username + ' vừa đăng nhập ' + socket.id);
            socket.username = data.username;
            socket.nickname = data.nickname;
            socket.fullname = data.fullname;
            socket.status = data.status;
            socket.login = 'on';

            if (socket.status === 'online') {
                let result = USERSDATA.find(user => {
                    return user.username === socket.username && user.status === 'online';
                });
                // console.log('Find this user isOnline result ---------');
                // console.log(result);
                if (!result) {
                    let emitData = {
                        username: socket.username,
                        fullname: socket.fullname,
                        mess: socket.nickname + ' vừa Online!'
                    }
                    socket.broadcast.emit('user-is-now-online', emitData);
                }
            }

            let userData = {
                socketId: socket.id,
                username: socket.username,
                nickname: socket.nickname,
                fullname: socket.fullname,
                status: socket.status
            }
            USERSDATA.push(userData);
            console.log(USERSDATA);
            socket.emit('EMIT-USERSDATA', USERSDATA);
            socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);

            socket.broadcast.emit('user-login', socket.username);
        });
        socket.on('this-user-login', data => {
            console.log(socket.username + ' vừa đăng nhập ở 1 Cửa sổ khác ' + socket.id);
            socket.status = data.status;
            socket.login = 'on';

            let userData = {
                socketId: socket.id,
                username: socket.username,
                nickname: socket.nickname,
                fullname: socket.fullname,
                status: socket.status
            }
            USERSDATA.push(userData);
            console.log(USERSDATA);
            socket.emit('EMIT-USERSDATA', USERSDATA);
            socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);
        });

        socket.on('user-logout', data => {
            console.log(socket.username + ' vừa đăng xuất ' + socket.id + ' On status: ' + socket.status);
            socket.login = 'off';

            let thisUser = USERSDATA.find(user => {
                return user.socketId === socket.id;
            });
            let index = USERSDATA.indexOf(thisUser);
            USERSDATA.splice(index, 1);
            console.log(USERSDATA);
            socket.emit('EMIT-USERSDATA', USERSDATA);
            socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);

            socket.broadcast.emit('user-logout', socket.username);

            if (socket.status === 'online') {
                let thisUserIsOnline = [];
                USERSDATA.forEach(e => {
                    if (e.username === socket.username && e.status === 'online') {
                        thisUserIsOnline.push(e);
                    }
                });
                // console.log('This User isOnline -----------------');
                // console.log(thisUserIsOnline);
                if (thisUserIsOnline.length === 0) {
                    let emitData = {
                        username: socket.username,
                        mess: socket.nickname + ' đã thoát!'
                    }
                    socket.broadcast.emit('user-is-offline', emitData);
                }
            }
        });
        socket.on('this-user-logout', username => {
            console.log(socket.username + ' trên 1 Cửa sổ khác cũng đã đăng xuất ' + socket.id + ' On status: ' + socket.status);
            socket.login = 'off';

            let thisUser = USERSDATA.find(user => {
                return user.socketId === socket.id;
            });
            let index = USERSDATA.indexOf(thisUser);
            USERSDATA.splice(index, 1);
            console.log(USERSDATA);
            socket.emit('EMIT-USERSDATA', USERSDATA);
            socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);

            if (socket.status === 'online') {
                let thisUserIsOnline = [];
                USERSDATA.forEach(e => {
                    if (e.username === socket.username && e.status === 'online') {
                        thisUserIsOnline.push(e);
                    }
                });
                // console.log('This User isOnline -----------------');
                // console.log(thisUserIsOnline);
                if (thisUserIsOnline.length === 0) {
                    let emitData = {
                        username: socket.username,
                        fullname: socket.fullname,
                        mess: socket.nickname + ' đã thoát!'
                    }
                    socket.broadcast.emit('user-is-offline', emitData);
                }
            }
        });

        socket.on('user-change-status', data => {
            socket.status = data.status;

            if (socket.status === 'online') {
                let thisUserIsOnline = [];
                USERSDATA.forEach(e => {
                    if (e.status === 'online') {
                        thisUserIsOnline.push(e);
                    }
                });
                if (thisUserIsOnline.length === 0) {
                    let emitData = {
                        username: socket.username,
                        fullname: socket.fullname,
                        mess: socket.nickname + ' Vừa Online'
                    }
                    socket.broadcast.emit('user-is-now-online', emitData);
                }
            }

            USERSDATA.forEach(e => {
                if (e.socketId === socket.id) {
                    e.status = socket.status;
                }
            });
            console.log(USERSDATA);
            socket.emit('EMIT-USERSDATA', USERSDATA);
            socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);

            if (socket.status === 'offline') {
                let thisUserNotOffline = [];
                USERSDATA.forEach(e => {
                    if (e.status !== 'offline') {
                        thisUserNotOffline.push(e);
                    }
                });
                if (thisUserNotOffline.length === 0) {
                    let emitData = {
                        username: socket.username,
                        fullname: socket.fullname,
                        mess: socket.nickname + ' đã thoát!'
                    }
                    socket.broadcast.emit('user-is-offline', emitData);
                }
            }

            socket.broadcast.emit('user-change-status', socket.username);
        });
        socket.on('this-user-change-status', status => {
            socket.status = status;
            if (socket.status === 'online') {
                let thisUserIsOnline = [];
                USERSDATA.forEach(e => {
                    if (e.status === 'online') {
                        thisUserIsOnline.push(e);
                    }
                });
                if (thisUserIsOnline.length === 0) {
                    let emitData = {
                        username: socket.username,
                        fullname: socket.fullname,
                        mess: socket.nickname + ' Vừa Online'
                    }
                    socket.broadcast.emit('user-is-now-online', emitData);
                }
            }
            
            USERSDATA.forEach(e => {
                if (e.socketId === socket.id) {
                    e.status = socket.status;
                }
            });
            console.log(USERSDATA);
            socket.emit('EMIT-USERSDATA', USERSDATA);
            socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);

            if (socket.status === 'offline') {
                let thisUserNotOffline = [];
                USERSDATA.forEach(e => {
                    if (e.status !== 'offline') {
                        thisUserNotOffline.push(e);
                    }
                });
                if (thisUserNotOffline.length === 0) {
                    let emitData = {
                        username: socket.username,
                        fullname: socket.fullname,
                        mess: socket.nickname + ' đã thoát!'
                    }
                    socket.broadcast.emit('user-is-offline', emitData);
                }
            }
        });
        //LISTEN ON USER ACTIONS

        //LISTEN ON ANY ACTIONS
        socket.on("client_emit", data => {
            let message = data.message;
            let emit = data.emit;
            let broadcast = data.broadcast;
            let content = data.content;
            if (emit) {
                socket.emit(message, content);
            }
            if (broadcast) {
                socket.broadcast.emit(message, content);
            }
        });
        //LISTEN ON ANY ACTIONS


        //LISTTEN ON CLIENT DISCONNECT
        socket.on("disconnect", function () {
            console.log(socket.nickname + ' has been disconnect (' + socket.id + ')');

            let thisUser = USERSDATA.find(user => {
                return user.socketId === socket.id;
            });
            let index = USERSDATA.indexOf(thisUser);
            USERSDATA.splice(index, 1);
            console.log(USERSDATA);
            socket.emit('EMIT-USERSDATA', USERSDATA);
            socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);

            if (socket.login === 'on' && socket.status === 'online') {
                let thisUserIsOnline = [];
                USERSDATA.forEach(e => {
                    if (e.username === socket.username && e.status === 'online') {
                        thisUserIsOnline.push(e);
                    }
                });
                // console.log('This User isOnline -----------------');
                // console.log(thisUserIsOnline);
                if (thisUserIsOnline.length === 0) {
                    let emitData = {
                        username: socket.username,
                        fullname: socket.fullname,
                        mess: socket.nickname + ' đã thoát!'
                    }
                    socket.broadcast.emit('user-is-offline', emitData);
                }
            }
        });
    });
}