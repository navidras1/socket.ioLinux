export class RedisActions {

    static async getUserDetail(client, key) {
        let strRes = await client.get(key);
        let objRes = JSON.parse(strRes);
        return objRes;
    }

    static async checkIfUserSocketExists(server, client, key) {
        let strRes = await client.get(key);
        if (strRes) {
            let objRes = JSON.parse(strRes);
            // objRes.socketId;
            let foundSocket = server.sockets.sockets.get(objRes.socketId);
            if (foundSocket) {
               await foundSocket.disconnect(true);
            }
        }

    }

    static async disconnectCurrentUser(socket, client, key) {
        let strRes = await client.get(key);
        if (strRes) {
            let objRes = JSON.parse(strRes);
            // objRes.socketId;
               await socket.disconnect(true);
            
        }
    }

    static wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
      }

}