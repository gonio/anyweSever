const express = require('express');
const _ = require('lodash');
const { json2 } = require('../util/utils');
const router = express.Router();

const rooms = {}; // 房间列表 -> 玩家信息
const roomsInterval = {}; // 房间列表 -> 定时器
const wsList = {}; // 玩家 -> 玩家ws
const playerMap = {}; // 玩家 -> 玩家房主id

router.ws('/link', (ws, req) => {
    wsList[req.session.name] = ws;
    ws.on('message', data => {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return;
        }

        // 需要通知所有玩家
        if (data.type === 'start') {
            start(data);
            return;
        }

        // 需要通知所有玩家
        if (data.type === 'update') {
            update(data);
            return;
        }

        // 房主踢人
        if (data.type === 'kick') {
            kick(data);
            return;
        }

        if (data.isRoomOwner) {
            if (!rooms.hasOwnProperty(req.session.name)) {
                rooms[req.session.name] = {
                    info: {
                        title: '房间',
                        id: req.session.name
                    },
                    players: [{ name: req.session.name, isOwner: true }]
                };
            }
            playerMap[req.session.name] = req.session.name;
            ws.send(json2(rooms[req.session.name]));
        } else {
            if (!rooms[data.roomID]) {
                ws.send(json2({}, false));
                return;
            }
            rooms[data.roomID].players.push({ name: req.session.name, isOwner: false, isReady: false });
            playerMap[req.session.name] = data.roomID;
            ws.send(json2(rooms[data.roomID]));
            _.each(rooms[data.roomID].players, player => {
                wsList[player.name].send(json2(rooms[data.roomID]));
            });
        }
    });

    /**
     * 开始游戏
     * @param data
     */
    function start (data) {

        // 是房主才能开始
        if (!rooms[req.session.name]) {
            ws.send(json2({}, false, '您不是房主'));
            return;
        }
        _.each(wsList, ws => {
            ws.send(json2({ type: 'start' }));
        });

        // 1s同步一次
        clearInterval(roomsInterval[data.roomID]);
        roomsInterval[data.roomID] = setInterval(function () {
            _.each(rooms[data.roomID].players, player => {
                wsList[player.name].send(json2(rooms[data.roomID]));
            });
        }, 1000);
    }

    /**
     * 更新游戏信息
     * @param data
     */
    function update (data = {}) {

        // 房间不存在
        const currentData = rooms[playerMap[req.session.name]];
        if (!rooms[playerMap[req.session.name]]) {
            ws.send(json2({}, false, '游戏已结束'));
            return;
        }

        // 替换成新的状态
        if (!_.isEmpty(data)) {
            _.some(currentData.players, player => {
                if (player.name === req.session.name) {
                    Object.assign(player, data);
                    return true;
                }
            });
        }

        _.each(wsList, ws => {
            ws.send(json2({ type: 'update', players: currentData.players }));
        });
    }

    /**
     * 踢人
     * @param data
     */
    function kick (data) {

        // 是房主才能踢人
        if (!rooms[req.session.name]) {
            ws.send(json2({}, false, '您不是房主'));
            return;
        }

        const currentData = rooms[req.session.name];
        currentData.players = _.filter(currentData.players, player => player.name !== data.id);

        update();
    }

    // 退游
    ws.on('close', () => {
        // 不是房主退出，则更新其他玩家
        // 是房主，其他玩家都要退
        if (rooms[req.session.name]) {
            _.each(rooms[req.session.name].players, player => {
                if (player.name !== req.session.name) {
                    wsList[player.name].send(json2({ type: 'quit' }));
                }
            });
        } else {
            if (rooms[playerMap[req.session.name]]) {
                let room = rooms[playerMap[req.session.name]];
                room.players = _.filter(room.players, player => player.name !== req.session.name);
                _.each(room.players, player => wsList[player.name].send(json2({ type: 'update', players: room.players })));
            }
        }

        delete rooms[req.session.name];
        delete wsList[req.session.name];
        delete playerMap[req.session.name];
    });
});

module.exports = { ws: router, rooms };
