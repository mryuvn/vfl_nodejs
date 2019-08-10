module.exports = function (io) {

    var func = require('./func');
    var md5 = require('md5');
    var db_model = require('../models/db_models');
    var data_table = 'mryu_users';

    var USERSDATA = [];
    var CUSTOMERSDATA = [];
    var VISITORS_DATA = [];

    io.sockets.on("connection", function (socket) {
        console.log("Có thằng vừa truy cập! ID = " + socket.id + ' username = ' + socket.username);
        socket.emit('check-user-conecting', { 
            socketId: socket.id,
            defaultUser: md5(socket.id + new Date()).slice(0, 20)
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
            if (thisUser) {
                let index = USERSDATA.indexOf(thisUser);
                USERSDATA.splice(index, 1);
                console.log(USERSDATA);
                socket.emit('EMIT-USERSDATA', USERSDATA);
                socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);
            }

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
            if (thisUser) {
                let index = USERSDATA.indexOf(thisUser);
                USERSDATA.splice(index, 1);
                console.log(USERSDATA);
                socket.emit('EMIT-USERSDATA', USERSDATA);
                socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);
            }

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

        socket.on("GET-USERDATA", data => {
            socket.emit('EMIT-USERSDATA', USERSDATA);
        });
        //LISTEN ON USER ACTIONS

        //LISTEN ON VISITOR ACTIONS
        socket.on("visitor-info", info => {
            console.log(info);
            socket.username = info.username;
            socket.name = info.name;
            socket.broadcast.emit("visitor-info", info);
            const rs = VISITORS_DATA.find(data => data.socketId === info.socketId);
            if (!rs) {
                VISITORS_DATA.push(info);
            }
            console.log('-------- VISITORS_DATA --------');
            console.log(VISITORS_DATA);
            io.sockets.emit('EMIT-VISITORS-DATA', VISITORS_DATA);
        });

        socket.on("update-visitor-id", id => {
            VISITORS_DATA.forEach(e => {
                if (e.socketId === socket.id) {
                    e.id = id;
                }
            });
            socket.broadcast.emit('EMIT-VISITORS-DATA', VISITORS_DATA);
        });

        socket.on('visitor-change-url', link => {
            console.log(socket.id + ' changed url to ' + link);
            VISITORS_DATA.forEach(e => {
                if (e.socketId === socket.id) {
                    e.link = link;
                }
            });
            console.log('-------- VISITORS_DATA --------');
            console.log(VISITORS_DATA);
            socket.broadcast.emit('EMIT-VISITORS-DATA', VISITORS_DATA);
        });

        socket.on('visitor-update-data', data => {
            VISITORS_DATA.forEach(e => {
                console.log(e.visitorData.username);
                if (e.visitorData.username === data.username) {
                    console.log('Change!');
                    e.visitorData = data;
                }
            });
            console.log(VISITORS_DATA);
            socket.broadcast.emit('EMIT-VISITORS-DATA', VISITORS_DATA);
        });

        socket.on('visitor-login-chat', username => {
            socket.broadcast.emit('visitor-login-chat', username);
        });

        socket.on('visitor-logout-chat', username => {
            socket.broadcast.emit('visitor-logout-chat', username);
        });

        socket.on('GET-VISITORS-DATA', () => {
            socket.emit('EMIT-VISITORS-DATA', VISITORS_DATA);
        });
        //LISTEN ON VISITOR ACTIONS

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

        //LISTEN ON MESSAGE
        socket.on("message", message => {
            let data = {
                id: socket.id,
                message: message
            }
            io.sockets.emit("message", data); //Emit to all sockets
        });
        //LISTEN ON MESSAGE

        //LISTEN ON CHAT APP
        socket.on("visitor-chat", data => {
            socket.broadcast.emit("visitor-chat", data);
        });
        socket.on("update_visitor_chat_content", data => {
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
        socket.on("clear-visitor-chat-attention", data => {
            socket.broadcast.emit('clear-visitor-chat-attention', data);
        });

        socket.on("member-create-private-room-chat", data => {
            socket.broadcast.emit("member-create-private-room-chat", data);
        });
        
        socket.on("member-chat", data => {
            socket.broadcast.emit("member-chat", data);
        });
        socket.on("update_member_chat_content", data => {
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
        //LISTEN ON CHAT APP

        //LISTTEN ON CLIENT DISCONNECT
        socket.on("disconnect", function () {
            let time = new Date();
            console.log(socket.nickname + ' has been disconnect (' + socket.id + ') on ' + time);

            //USER DISCONNECT
            let thisUser = USERSDATA.find(user => {
                return user.socketId === socket.id;
            });
            if (thisUser) {
                let index = USERSDATA.indexOf(thisUser);
                USERSDATA.splice(index, 1);
                console.log(USERSDATA);
                socket.emit('EMIT-USERSDATA', USERSDATA);
                socket.broadcast.emit('EMIT-USERSDATA', USERSDATA);
            }

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
            //USER DISCONNECT

            //VISITOR DISCONNECT
            let thisVisitor = VISITORS_DATA.find(visitor => {
                return visitor.socketId === socket.id;
            });
            if (thisVisitor) {
                if (thisVisitor.id) {
                    func.updateVisitorDisconnectedTime(thisVisitor.id, time);
                }

                let index = VISITORS_DATA.indexOf(thisVisitor);
                VISITORS_DATA.splice(index, 1);
            }
            console.log(VISITORS_DATA);
            socket.broadcast.emit('EMIT-VISITORS-DATA', VISITORS_DATA);
            //VISITOR DISCONNECT
        });
    });
}