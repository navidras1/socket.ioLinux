import { ApiCall } from "./ApiCall.js";
import { RedisActions } from "./RedisActions.js";

export var OfflineActions = new Map();

OfflineActions.set(
  "SEEN_MESSAGE",
  async (request, socket, server, client, acc) => {
    let param = {
      toUserName: request.data.payLoad.userName,
    };

    // let result = await ApiCall.UpdateMessageToReadFromTo(
    //   socket.handshake.headers.authorization,
    //   param
    // );

    let seen = {
      type: "SEEN_MESSAGE",
      payLoad: {
        fromUserName: socket.username,
        toUserName: request.data.payLoad.userName,
        messageGuid: request.data.payLoad.messageGuid,
      },
    };

    let tmpUsr = await RedisActions.getUserDetail(
      client,
      request.data.payLoad.userName
    );
    let isUserOnline = false;
    if (tmpUsr != null) {
      server.to(tmpUsr.socketId).emit("offlineAction", [seen]);
      isUserOnline = true;
    }

    // else {
    let InstertToOffLineActionParam = {
      toUserName: request.data.payLoad.userName,
      actionTypeId: 1,
      action: JSON.stringify(seen),
      IsOnline: isUserOnline,
    };

    let insertResult = await ApiCall.InstertToOffLineAction(
      socket.handshake.headers.authorization,
      InstertToOffLineActionParam
    );
    // }
  }
);

OfflineActions.set(
  "DELETE_MESSAGE",
  async (request, socket, server, client, acc) => {
    let deleteChatOfflineParam = {
      username: request.data.payLoad.userName,
      messageGuid: request.data.payLoad.messageGuid,
    };

    // var res = await ApiCall.DeleteChatOffline(
    //   socket.handshake.headers.authorization,
    //   deleteChatOfflineParam
    // );

    let tmpUsr = await RedisActions.getUserDetail(
      client,
      request.data.payLoad.userName
    );
    let deleteMsg = {
      type: "DELETE_MESSAGE",
      payLoad: {
        fromUserName: socket.username,
        toUserName: request.data.payLoad.userName,
        messageGuid: request.data.payLoad.messageGuid,
      },
    };
    let isUserOnline = false;

    if (tmpUsr != null) {
      server.to(tmpUsr.socketId).emit("offlineAction", [deleteMsg]);
      isUserOnline = true;
    }

    let InstertToOffLineActionParam = {
      toUserName: request.data.payLoad.userName,
      actionTypeId: 2,
      action: JSON.stringify(deleteMsg),
      IsOnline: isUserOnline,
    };

    let insertResult = await ApiCall.InstertToOffLineAction(
      socket.handshake.headers.authorization,
      InstertToOffLineActionParam
    );
  }
);

OfflineActions.set(
  "DELETE_MESSAGE_ROOM",
  async (request, socket, server, client, acc) => {
    let deletRoomMsg = {
      type: "DELETE_MESSAGE_ROOM",
      payLoad: {
        roomName: request.data.payLoad.roomName,
        fromUserName: socket.username,
        messageGuids: request.data.payLoad.messageGuids,
      },
    };

    let chatRoomName = request.data.payLoad.roomName;

    socket.to(chatRoomName).emit("offlineAction", [deletRoomMsg]);

    // var res = await ApiCall.DeleteChatOffline(
    //   socket.handshake.headers.authorization,
    //   deleteChatOfflineParam
    // );

    let roomMembers = await ApiCall.RoomMembers(
      socket.handshake.headers.authorization,
      { roomName: chatRoomName, pageNumber: 1, pageSize: 50000 }
    );
    let onlineUserNames = await client.keys("*[^,ToEx]");
    let rsUsers = onlineUserNames.map((userName) => userName);

    let offLineUsers = roomMembers.roomMemberDetails.reduce((acc, curr) => {
      if (!rsUsers.includes(curr.userName)) {
        acc.push(curr.userName);
      }

      return acc;
    }, []);

    let actionToSend = {
      type: "DELETE_MESSAGE_ROOM",
      payLoad: {
        ChatLogGuids: request.data.payLoad.messageGuids,
        FromUserName: socket.username,
        UserList: offLineUsers,
        RoomName: chatRoomName,
      },
    };

    let InstertToOffLineActionParam = {
      toUserName: "",
      actionTypeId: 3,
      action: JSON.stringify(actionToSend),
      IsOnline: false,
    };

    let insertResult = await ApiCall.InstertToOffLineAction(
      socket.handshake.headers.authorization,
      InstertToOffLineActionParam
    );
  }
);
