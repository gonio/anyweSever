const express = require('express');
const router = express.Router();

const SEND_TYPE = {
    create: 0,  // 创建房间
    join: 1,    // 加入房间
};

let roomID = 1; // 房间号

// 房间号 -> 玩家信息
const userInfo = {};

router.ws('/link', (ws, req) => {
    ws.on('message', data => {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return;
        }

        switch (data.type) {
            case SEND_TYPE.create:
                userInfo[roomID] = {
                    index: 0,
                    roomID
                };
                break;
            case SEND_TYPE.join:
                userInfo[roomID] = {
                    index: 1,
                    roomID
                };
                break;
        }

    })
});

module.exports = router;
