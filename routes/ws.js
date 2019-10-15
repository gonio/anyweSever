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
            delete data.type;
            update(data);
            return;
        }

        // 房主踢人
        if (data.type === 'kick') {
            kick(data);
            return;
        }

        // 有人赢了，游戏结束
        if (data.type === 'win') {
            over(data);
            return;
        }

        if (data.isRoomOwner) {
            if (!rooms.hasOwnProperty(req.session.name)) {
                rooms[req.session.name] = {
                    info: {
                        title: '房间',
                        id: req.session.name
                    },
                    players: [{ name: req.session.name, isOwner: true, map: {} }]
                };
            }
            playerMap[req.session.name] = req.session.name;
            ws.send(json2(rooms[req.session.name]));
        } else {
            if (!rooms[data.roomID]) {
                ws.send(json2({}, false));
                return;
            }
            rooms[data.roomID].players.push({ name: req.session.name, isOwner: false, isReady: false, map: {} });
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

        // 校验参数
        if (!data.roomID || !rooms[data.roomID]) {
            ws.send(json2({}, false, '参数错误'));
            return;
        }

        // 更新所有人的信息，然后开始游戏
        updateAll({ map: data.map });

        _.each(wsList, (ws, name) => {
            ws.send(json2({ type: 'start', players: _.filter(rooms[data.roomID].players, item => item.name !== name) }));
        });

        // 1s同步一次
        clearInterval(roomsInterval[data.roomID]);
        roomsInterval[data.roomID] = setInterval(function () {
            _.each(rooms[data.roomID].players, player => {
                wsList[player.name].send(json2(rooms[data.roomID]));
            });
        }, 2000);
    }

    /**
     * 更新游戏信息
     * @param data
     * @param broadcast
     */
    function update (data = {}) {

        // 房间不存在
        if (!checkRoomExist(req)) {
            return;
        }

        const currentData = rooms[playerMap[req.session.name]];

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
     * 更新房间所有人的信息
     * @param data
     */
    function updateAll (data) {

        // 房间不存在
        if (!checkRoomExist(req)) {
            return;
        }

        const currentData = rooms[playerMap[req.session.name]];

        // 替换成新的状态
        if (!_.isEmpty(data)) {
            _.each(currentData.players, player => {
                Object.assign(player, data);
            });
        }
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

    /**
     * 游戏结束
     * @param data
     */
    function over (data) {

        // 房间不存在
        if (!checkRoomExist(req)) {
            return;
        }

        const room = rooms[playerMap[req.session.name]];
        _.each(room.players, player => wsList[player.name].send(json2({ type: 'over', name: req.session.name })));
        clearInterval(roomsInterval[req.session.name]);
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
                const room = rooms[playerMap[req.session.name]];
                room.players = _.filter(room.players, player => player.name !== req.session.name);
                _.each(room.players, player => wsList[player.name].send(json2({ type: 'update', players: room.players })));
            }
        }

        delete rooms[req.session.name];
        delete wsList[req.session.name];
        delete playerMap[req.session.name];
        clearInterval(roomsInterval[req.session.name]);
    });
});

module.exports = { ws: router, rooms };

function checkRoomExist (req) {

    // 房间不存在
    if (!rooms[playerMap[req.session.name]]) {
        ws.send(json2({}, false, '游戏已结束'));
        return false;
    }
    return true;
}
