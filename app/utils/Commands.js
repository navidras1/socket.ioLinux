import { ApiCall } from "./ApiCall.js";
import { v4 as uuidv4 } from "uuid";
import { RabbitMqAction } from "./RabbitMqAction.js";
import { RedisActions } from "./RedisActions.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { ChatStatus } from "./constant.js";
import { commandOptions } from "redis";
import { PrivateChatResponse } from "../models/PrivateChatResponse.js";
import { privateChatValidator } from "./validator/privateChatValidator.js";
import { isTypingValidator } from "./validator/isTypingValidator.js";
import { UpdateMessagesToReadValidator } from "./validator/UpdateMessagesToReadValidator.js";
import { ChatRoomMessageResponse } from "../models/ChatRoomMessageResponse.js";
import { Common } from "./Common.js";
import { OfflineActions } from "./OfflineActions.js";
import { ChatMessageV2 } from "../models/ChatMessageV2.js";
import { ChatRoomMessageResponseV2 } from "../models/ChatRoomMessageResponseV2.js";
//import { emit } from "nodemon";

export var Commnads = new Map();

try {
  Commnads.set("privateChat", async (request, socket, server, client, acc) => {
    try {
      var validator = new privateChatValidator();
      if (validator.validate(request.data)) {
        //socket.emit("generalMessage",validator.errorMessages);

        return validator.errorMessages;
        //throw new Error(validator.errorMessages);
        //return validator.errorMessages;
      }

      let DateNow = Date.now();
      let clientTime = Number.parseInt(request.data.clientTime);
      if (Math.abs(DateNow - clientTime) > 15000) {
        request.data.clientTime = DateNow;
      }

      request.data.from = socket.username;
      request.data.createdAt = Date.now();
      request.data._id = uuidv4();
      // generate guid for message
      let fileDetailResponse = null;
      if (request.data.attachmentId) {
        let fileDetailRequest = { id: request.data.attachmentId };
        fileDetailResponse = await ApiCall.GetFileDetail(
          socket.handshake.headers.authorization,
          fileDetailRequest
        );
      }

      let tmpCurrentUser = await RedisActions.getUserDetail(
        client,
        acc.UserName
      );

      let usersToSend = request.data.to.replaceAll(" ", "");
      usersToSend = usersToSend.toLowerCase();
      //usersToSend.replaceAll(' ');
      let usersList = usersToSend.split(",");

      let isRtl = false;
      if (request.data.IsRtl) {
        isRtl = request.data.IsRtl;
      }

      usersList.forEach(async (userName) => {
        if (userName == request.data.from) {
          socket.emit("generalMessage", {
            warning: "the sender and reciever can not be the same",
          });
        } else {
          let tmpUsr = await RedisActions.getUserDetail(client, userName);

          if (tmpUsr != null) {
            let readStatus = 1;

            if (server.sockets.sockets.get(tmpUsr.socketId)?.UserToCare) {
              //readStatus = 1;

              let userToCare = server.sockets.sockets.get(
                tmpUsr.socketId
              ).UserToCare;

              if (socket.username == userToCare) {
                readStatus = 2;
              }
            }
            let theMessage = [
              { Message: request.data.message, IsRtl: request.data.isRtl },
            ];

            let replyOfGuid = null;
            if (request.data?.replyOf !== undefined) {
              replyOfGuid = JSON.stringify(request.data.replyOf);
            }

            let dataToLog = {
              fromUserName: acc.UserName,
              fromEmpId: 0,
              toUserName: userName,
              ToEmPid: tmpUsr.userId,
              messages: theMessage,
              createDate: request.data.createdAt,
              chatGuId: request.data._id,
              ChatStatusId: readStatus,
              isRtl: isRtl,
              ClientDateTime: request.data.clientTime,
              AttachmentId: request.data.attachmentId,
              forwardedBy: request.data.forwardedBy,
              ReplyOfGuid: replyOfGuid,
            };
            await RabbitMqAction.PublishprivateChatLog(dataToLog);

            let privateChatMessage = new PrivateChatResponse();
            await privateChatMessage.setProps(
              socket.username,
              socket.userId,
              userName,
              request.data.message,
              request.data.isRtl,
              socket.handshake.headers.authorization,
              socket.fullName,
              socket.username,
              request.data._id,
              fileDetailResponse,
              request.data.forwardedBy,
              request.data.replyOf
            );

            //server.to(tmpUsr.socketId).emit("privateChat", request.data);
            // socket.emit("privateChatSelf", privateChatMessage);
            server.to(tmpUsr.socketId).emit("privateChat", privateChatMessage);
            server
              .to(tmpUsr.socketId)
              .emit("privateChatList", privateChatMessage);
          } else {
            ///socket.emit("privateChat", { from: "Sever", to: socket.username, message: `${userName} is offline`, isOnline: false });
            let theMessage = [
              { Message: request.data.message, IsRtl: request.data.isRtl },
            ];

            let replyOfGuid = null;
            if (request.data?.replyOf !== undefined) {
              replyOfGuid = JSON.stringify(request.data.replyOf);
            }

            let dataToLog = {
              fromUserName: acc.UserName,
              fromEmpId: 0,
              toUserName: userName,
              ToEmPid: 0,
              messages: theMessage,
              createDate: request.data.createdAt,
              chatGuId: request.data._id,
              ChatStatusId: 1,
              isRtl: isRtl,
              ClientDateTime: request.data.clientTime,
              AttachmentId: request.data.attachmentId,
              ForwardedBy: request.data.forwardedBy,
              ReplyOfGuid: replyOfGuid,
            };
            theMessage.forEach(async (msg) => {
              ///temporary disable pushNotification
              // let pustNotifRes =  await ApiCall.sendPushNotification(socket.handshake.headers.authorization, [userName], `You have message form ${acc.UserName}`, request.data.message, {
              //     "url": "private_chat",
              //     "userName": acc.UserName,
              //     "id": acc.UserId,
              //     "fullName": acc.fullName
              // });

              let messageBody = "";
              if (request.data.attachmentId) {
                messageBody = "You have new file message";
              } else {
                messageBody = request.data.message;
              }

              ////////////notification//////////////////////

              // let pustNotifRes = await ApiCall.sendPushNotification(
              //   socket.handshake.headers.authorization,
              //   [userName],
              //   socket.fullName,
              //   messageBody,
              //   {
              //     url: "private_chat",
              //     privateRoomRemoteId: socket.userId.toString(),
              //     roomFullName: socket.fullName,
              //     roomType: "private",
              //     roomUsername: socket.username,
              //   }
              // );

              ////////////notification//////////////////////

              //   const test1 =  {
              //         "config": {
              //           "privateRoomRemoteId": 2222,
              //           "roomFullName": "morteza aliaskari",
              //           "roomType": "channel",
              //           "roomUsername": "morteza"
              //         },
              //         "url": "private_chat"
              //       };
            });

            await RabbitMqAction.PublishprivateChatLog(dataToLog);
          }
        }
      });
    } catch (exxx) {
      console.log(`ERROR: ${exxx.message}`);
    }
    return {
      messageGUID: request.data._id,
      serverTime: request.data.clientTime,
    };
  });

  Commnads.set("getUsersList", async (request, socket, server, client, acc) => {
    var allOnlineUsers = await client.keys("*[^,ToEx]");
    //var res = myClientListObj.reduce((t, v) => v.username != userName ? [...t, { username: v.username }] : t, []);
    var res = allOnlineUsers.map((user) => ({ username: user }));
    socket.emit("getUsersList", res);
  });

  Commnads.set("isTyping", async (request, socket, server, client, acc) => {
    var validator = new isTypingValidator();
    if (validator.validate(request.data)) {
      return validator.errorMessages;
    }

    request.data.userName = socket.username;
    socket.broadcast.emit("isTyping", request.data);
  });
  Commnads.set(
    "getUsersToChat",
    async (request, socket, server, client, acc) => {
      let usersTochatRes = await ApiCall.getUsersToChat(
        socket.handshake.headers.authorization,
        request.data.page,
        request.data.pageSize,
        request.data.userNameSearch,
        acc.UserName,
        client
      );
      socket.emit("getUsersToChat", usersTochatRes);
    }
  );

  Commnads.set(
    "UpdateMessagesToRead",
    async (request, socket, server, client, acc) => {
      var validator = new UpdateMessagesToReadValidator();
      if (validator.validate(request.data)) {
        return validator.errorMessages;
      }
      let updateMessageToreadResult = await ApiCall.UpdateMessagesToRead(
        socket.handshake.headers.authorization,
        request.data.fromUserName
      );
      socket.emit("UpdateMessagesToRead", updateMessageToreadResult);
    }
  );

  Commnads.set("chatHistory", async (request, socket, server, client, acc) => {
    let chatHistory = await ApiCall.ChatHistory(
      socket.handshake.headers.authorization,
      request.data.user,
      request.data.pageNo,
      request.data.pageSize
    );
    socket.emit("chatHistory", chatHistory);
  });

  Commnads.set("getUsers", async (request, socket, server, client, acc) => {
    let onlineUserNames = await client.keys("*[^,ToEx]");
    let rsUsers = onlineUserNames.map((user) => ({ username: user }));
    socket.emit("getUsers", rsUsers);
  });

  Commnads.set(
    "SendToPickupRoom",
    async (request, socket, server, client, acc) => {
      let theMessage = request.data.message;
      socket.to("PickupRoom").emit("PickupRoom", theMessage);
    }
  );

  Commnads.set(
    "CreatePrivateRoom",
    async (request, socket, server, client, acc) => {
      let InviteeUserName = request.data.InviteeUserName;
      let res = await ApiCall.CreatePrivateChatRoom(
        socket.handshake.headers.authorization,
        InviteeUserName
      );
      socket.join(res.chatRoomName);
      socket.emit("generalMessage", res);

      let chatMessage = new ChatMessage(
        res.chatRoomName,
        socket.username,
        request.data.Message
      );
      let status = ChatStatus.Unread;

      let userDetail = await RedisActions.getUserDetail(
        client,
        InviteeUserName
      );
      if (userDetail) {
        server.sockets.sockets.get(userDetail.socketId).join(res.chatRoomName);
        server
          .to(userDetail.socketId)
          .emit(
            "generalMessage",
            `you have been invited to ${res.chatRoomName} by ${socket.username}`
          );
        socket.to(res.chatRoomName).emit("chatRoomMessage", chatMessage);
        status = ChatStatus.Read;
      }
      chatMessage.status = status;
      RabbitMqAction.PublishChatRoomLog(chatMessage);
    }
  );

  Commnads.set(
    "messageToChatRoom",
    async (request, socket, server, client, acc) => {
      let fileDetailResponse = null;
      if (request.data.attachmentId) {
        let fileDetailRequest = { id: request.data.attachmentId };
        fileDetailResponse = await ApiCall.GetFileDetail(
          socket.handshake.headers.authorization,
          fileDetailRequest
        );
      }

      let chatGuidForRoom = uuidv4();
      let chatRoomName = request.data.chatRoomName;
      let message = request.data.message;
      let DateNow = Date.now();
      let clientTime = Number.parseInt(request.data.clientTime);
      if (Math.abs(DateNow - clientTime) > 15000) {
        request.data.clientTime = DateNow;
      }

      let canSendRequest = {
        ChatRoomName: chatRoomName,
        userName: socket.username,
      };

      var canSendmsg = await ApiCall.CanSendMessageToRoom(
        socket.handshake.headers.authorization,
        canSendRequest
      );
      if (canSendmsg.canSend === false) {
        return canSendmsg;
      }

      let messagesToLog = [
        {
          message: request.data.message,
          isRtl: request.data.isRtl,
          clientTime: request.data.clientTime,
          attachmentId: request.data.attachmentId,
          chatGuid: chatGuidForRoom,
        },
      ];

      let chatMessage = new ChatMessage();
      let chatRoomMessageResponse = new ChatRoomMessageResponse();

      chatRoomMessageResponse.setProps(
        chatRoomName,
        canSendmsg.roomType,
        socket.username,
        message,
        request.data.isRtl,
        socket.userId,
        socket.fullName,
        chatGuidForRoom,
        fileDetailResponse,
        request.data.forwardedBy,
        request.data.replyOf
      );

      let replyOfGuid = null;
      if (request.data?.replyOf !== undefined) {
        replyOfGuid = JSON.stringify(request.data.replyOf);
      }

      chatMessage.setProps(
        request.data.chatRoomName,
        socket.username,
        messagesToLog,
        request.data.forwardedBy
      );

      socket.to(chatRoomName).emit("chatRoomMessage", chatRoomMessageResponse);
      //socket.emit("chatRoomMessage", chatRoomMessageResponse);
      let status = ChatStatus.Unread;

      chatMessage.status = status;
      chatMessage.replyOfGuid = replyOfGuid;
      RabbitMqAction.PublishChatRoomMessageLog(chatMessage);

      let pushMessage = "";
      if (request.data.attachmentId) {
        pushMessage = "You have new file message";
      } else {
        pushMessage = "You have new message";
      }

      if (chatRoomName !== "Griffin_Support") {
        let roomMembers = await ApiCall.RoomMembersWithNotif(
          socket.handshake.headers.authorization,
          { roomName: chatRoomName, pageNumber: 1, pageSize: 50000 }
        );
        let onlineUserNames = await client.keys("*[^,ToEx]");
        let rsUsers = onlineUserNames.map((userName) => userName);

        let usersToSend = roomMembers.roomMemberDetails.reduce((acc, curr) => {
          if (!rsUsers.includes(curr.userName)) {
            acc.push(curr.userName);
          }

          return acc;
        }, []);

        let test1234 = 56;

        ////////////notification//////////////////////

        // let pustNotifRes = ApiCall.sendPushNotification(
        //   socket.handshake.headers.authorization,
        //   usersToSend,
        //   chatRoomName,
        //   pushMessage,
        //   {
        //     url: "private_chat",
        //     roomFullName: chatRoomName,
        //     roomType: canSendmsg.roomType,
        //     roomUsername: chatRoomName,
        //   }
        // );

        ////////////notification//////////////////////
      }

      return {
        messageGUID: chatGuidForRoom,
        serverTime: request.data.clientTime,
      };
    }
  );


  Commnads.set(
    "messageToChatRoomV2",
    async (request, socket, server, client, acc) => {
      let fileDetailResponse = null;
      if (request.data.attachmentId) {
        let fileDetailRequest = { id: request.data.attachmentId };
        fileDetailResponse = await ApiCall.GetFileDetail(
          socket.handshake.headers.authorization,
          fileDetailRequest
        );
      }

      let chatGuidForRoom = uuidv4();
      let chatRoomId = request.data.chatRoomId;
      let message = request.data.message;
      let DateNow = Date.now();
      let clientTime = Number.parseInt(request.data.clientTime);
      if (Math.abs(DateNow - clientTime) > 15000) {
        request.data.clientTime = DateNow;
      }

      let canSendRequest = {
        chatRoomId: chatRoomId,
        userName: socket.username,
      };

      var canSendmsg = await ApiCall.CanSendMessageToRoomV2(
        socket.handshake.headers.authorization,
        canSendRequest
      );
      if (canSendmsg.canSend === false) {
        return canSendmsg;
      }

      let messagesToLog = [
        {
          message: request.data.message,
          isRtl: request.data.isRtl,
          clientTime: request.data.clientTime,
          attachmentId: request.data.attachmentId,
          chatGuid: chatGuidForRoom,
        },
      ];

      let chatMessage = new ChatMessageV2();
      let chatRoomMessageResponse = new ChatRoomMessageResponseV2();

      chatRoomMessageResponse.setProps(
        chatRoomId,
        canSendmsg.roomType,
        socket.username,
        message,
        request.data.isRtl,
        socket.userId,
        socket.fullName,
        chatGuidForRoom,
        fileDetailResponse,
        request.data.forwardedBy,
        request.data.replyOf
      );

      let replyOfGuid = null;
      if (request.data?.replyOf !== undefined) {
        replyOfGuid = JSON.stringify(request.data.replyOf);
      }

      chatMessage.setProps(
        request.data.chatRoomName,
        socket.username,
        messagesToLog,
        request.data.forwardedBy
      );

      socket.to(chatRoomId).emit("chatRoomMessage", chatRoomMessageResponse);
      //socket.emit("chatRoomMessage", chatRoomMessageResponse);
      let status = ChatStatus.Unread;

      chatMessage.status = status;
      chatMessage.replyOfGuid = replyOfGuid;
      RabbitMqAction.PublishChatRoomMessageLog(chatMessage);

      let pushMessage = "";
      if (request.data.attachmentId) {
        pushMessage = "You have new file message";
      } else {
        pushMessage = "You have new message";
      }

      if(canSendmsg.canGetPushNotification===true){
      //if (chatRoomId !== "Griffin_Support") {
        let roomMembers = await ApiCall.RoomMembersWithNotifV2(
          socket.handshake.headers.authorization,
          { roomId: chatRoomId, pageNumber: 1, pageSize: 50000 }
        );
        let onlineUserNames = await client.keys("*[^,ToEx]");
        let rsUsers = onlineUserNames.map((userName) => userName);

        let usersToSend = roomMembers.roomMemberDetails.reduce((acc, curr) => {
          if (!rsUsers.includes(curr.userName)) {
            acc.push(curr.userName);
          }

          return acc;
        }, []);

        let test1234 = 56;

        ////////////notification//////////////////////

        let pustNotifRes = ApiCall.sendPushNotification(
          socket.handshake.headers.authorization,
          usersToSend,
          chatRoomName,
          pushMessage,
          {
            url: "private_chat",
            roomFullName: chatRoomName,
            roomType: canSendmsg.roomType,
            roomUsername: chatRoomName,
          }
        );

        ////////////notification//////////////////////
      }

      return {
        messageGUID: chatGuidForRoom,
        serverTime: request.data.clientTime,
      };
    }
  );


  Commnads.set("ForceMessage", async (request, socket, server, client, acc) => {
    //let onlineUserNames = await client.keys("*[^,ToEx]");
    socket.broadcast.emit("ForceMessage", "hello");
  });

  Commnads.set(
    "GetRoomMessages",
    async (request, socket, server, client, acc) => {
      let getRoomMessagesResult = await ApiCall.GetRoomMessages(
        socket.handshake.headers.authorization,
        request.data
      );
      socket.emit("GetRoomMessages", getRoomMessagesResult);
    }
  );

  Commnads.set(
    "GetUserStatus",
    async (request, socket, server, client, acc) => {
      let tmpUsr = await RedisActions.getUserDetail(client, request.data.for);

      if (tmpUsr != null) {
        socket.emit("GetUserStatus", {
          userName: request.data.for,
          isOnline: true,
        });
        server.to(tmpUsr.socketId).emit("allMessageSeen", {
          fromUserName: socket.username,
          allMessageSeen: true,
        });
      } else {
        socket.emit("GetUserStatus", {
          userName: request.data.for,
          isOnline: false,
        });
      }
    }
  );

  Commnads.set(
    "GetMastersOfContact",
    async (request, socket, server, client, acc) => {
      let masters = await ApiCall.GetMastersOfContact(
        socket.handshake.headers.authorization
      );
      let onlineUserNames = await client.keys("*[^,ToEx]");
      //let rsUsers = onlineUserNames.map(user => ({ username: user }));
      const onlineMasters = onlineUserNames.filter((userName) =>
        masters.includes(userName)
      );

      onlineMasters.map(async (user) => {
        let tmpUsr = await RedisActions.getUserDetail(client, user);
        if (tmpUsr) {
          socket.to(tmpUsr.socketId).emit("GetUserStatus", {
            userName: `${socket.username}`,
            isOnline: request.data.isOnline,
          });
        }
      });
    }
  );

  Commnads.set(
    "GetCaredMastersOfContact",
    async (request, socket, server, client, acc) => {
      let masters = await ApiCall.GetMastersOfContact(
        socket.handshake.headers.authorization
      );
      let onlineUserNames = await client.keys("*[^,ToEx]");
      //let rsUsers = onlineUserNames.map(user => ({ username: user }));

      let onlineMasters = onlineUserNames.filter((userName) =>
        masters.includes(userName)
      );

      onlineMasters.map(async (user) => {
        let tmpUsr = await RedisActions.getUserDetail(client, user);
        let theUser = server.sockets.sockets.get(tmpUsr.socketId);
        if (theUser && theUser.UserToCare == socket.username) {
          socket.to(theUser.id).emit("GetCaredUserStatus", {
            userName: `${socket.username}`,
            isOnline: request.data.isOnline,
          });
        }
      });
    }
  );

  Commnads.set(
    "SetUserToCare",
    async (request, socket, server, client, acc) => {
      let userName = request.data.userName;
      socket.UserToCare = userName;
      socket.emit("UserToCare", { userName: socket.UserToCare });
    }
  );

  Commnads.set(
    "GetUserToCare",
    async (request, socket, server, client, acc) => {
      socket.emit("UserToCare", { userName: socket.UserToCare });
    }
  );

  Commnads.set(
    "UnsetUserToCare",
    async (request, socket, server, client, acc) => {
      socket.UserToCare = "";
      socket.emit("UserToCare", { userName: socket.UserToCare });
    }
  );

  Commnads.set(
    "CreateGeneralChatRoom",
    async (request, socket, server, client, acc) => {
      let inviteeUserNamesStr = request.data.inviteeUserNames
        .map((user) => user.userName)
        .join(",");
      //let inviteeUserNamesStr = request.data.inviteeUserNames;
      let chatRoomName = request.data.chatRoomName;
      let description = request.data.description;

      let res = await ApiCall.CreateGeneralChatRoom(
        socket.handshake.headers.authorization,
        inviteeUserNamesStr,
        chatRoomName,
        description
      );
      socket.join(res.chatRoomName);
      socket.emit("generalMessage", res);

      let chatMessage = new ChatMessage(
        res.chatRoomName,
        socket.username,
        `Welcome to room ${res.chatRoomName} You are invited by ${socket.username}`
      );
      let status = ChatStatus.Unread;

      inviteeUserNamesStr = inviteeUserNamesStr.replaceAll(" ", "");
      let userList = inviteeUserNamesStr.split(",");
      userList.map(async (user) => {
        let userDetail = await RedisActions.getUserDetail(client, user);
        if (userDetail) {
          server.sockets.sockets
            .get(userDetail.socketId)
            .join(res.chatRoomName);
          server
            .to(userDetail.socketId)
            .emit(
              "generalMessage",
              `you have been invited to ${res.chatRoomName} by ${socket.username}`
            );
          socket.to(res.chatRoomName).emit("chatRoomMessage", chatMessage);
          status = ChatStatus.Read;
        }
      });

      // let userDetail = await RedisActions.getUserDetail(client, InviteeUserName);
      // if (userDetail) {

      //     server.sockets.sockets.get(userDetail.socketId).join(res.chatRoomName);
      //     server.to(userDetail.socketId).emit("generalMessage", `you have been invited to ${res.chatRoomName} by ${socket.username}`);
      //     socket.to(res.chatRoomName).emit("chatRoomMessage", chatMessage);
      //     status = ChatStatus.Read;

      // }
      chatMessage.status = status;
      RabbitMqAction.PublishChatRoomLog(chatMessage);
    }
  );

  Commnads.set(
    "GetLastSeenOfEmp",
    async (request, socket, server, client, acc) => {
      let userName = request.data.userName;
      var res = await ApiCall.GetLastSeenOfEmp(
        socket.handshake.headers.authorization,
        userName
      );
      socket.emit("GetLastSeenOfEmp", res);
    }
  );

  Commnads.set(
    "GetUserChatHistoryV3",
    async (request, socket, server, client, acc) => {
      let timeStamp = request.data.fromTimeStamp;
      var res = await ApiCall.GetUserChatHistoryV3(
        socket.handshake.headers.authorization,
        timeStamp
      );
      return res;
    }
  );

  Commnads.set("Pooling", async (request, socket, server, client, acc) => {
    let timeStamp = request.data.fromTimeStamp;
    var res = await ApiCall.Pooling(
      socket.handshake.headers.authorization,
      timeStamp
    );
    return res;
  });

  //HistoryChatOfUsers

  Commnads.set(
    "HistoryChatOfUsers",
    async (request, socket, server, client, acc) => {
      let userGuids = request.data.userGuidMap;
      var res = await ApiCall.HistoryChatOfUsers(
        socket.handshake.headers.authorization,
        userGuids
      );
      return res;
    }
  );

  Commnads.set(
    "HistoryChatOfUsersV2",
    async (request, socket, server, client, acc) => {
      let userGuids = request.data.userGuidMap;
      var res = await ApiCall.HistoryChatOfUsersV2(
        socket.handshake.headers.authorization,
        userGuids
      );
      return res;
    }
  );

  Commnads.set(
    "DeletePrivateChat",
    async (request, socket, server, client, acc) => {
      let messageIds = request.data.messageIds;
      let param = { privateChatIds: messageIds };
      var res = await ApiCall.DeletePrivateChat(
        socket.handshake.headers.authorization,
        param
      );
      return res;
    }
  );

  Commnads.set(
    "OffLineAction",
    async (request, socket, server, client, acc) => {
      var res = OfflineActions.get(request.data.type)(
        request,
        socket,
        server,
        client,
        acc
      );

      return res;
    }
  );

  Commnads.set("CheckOffline", async (request, socket, server, client, acc) => {
    //socket.handshake.headers.authorization
    var res = await ApiCall.CheckOfflineActions(
      socket.handshake.headers.authorization
    );
    socket.emit("CheckOffline", res);

    //return res;
  });

  Commnads.set(
    "MakeOfflineActionDone",
    async (request, socket, server, client, acc) => {
      //socket.handshake.headers.authorization
      var res = await ApiCall.MakeOfflineActionDone(
        socket.handshake.headers.authorization
      );
    }
  );

  Commnads.set(
    "AddUsersToRoom",
    async (request, socket, server, client, acc) => {
      let roomName = request.data.roomName;
      let inviteeUserNames = request.data.inviteeUserNames;
      let apiParam = {
        roomName: roomName,
        inviteeUserNames: inviteeUserNames,
      };

      let AddUserToRoomRes = await ApiCall.AddUserToRoom(
        socket.handshake.headers.authorization,
        apiParam
      );

      let tmpUsr = await RedisActions.getUserDetail(client, inviteeUserNames);

      if (tmpUsr) {
        server.sockets.sockets.get(tmpUsr.socketId).join(roomName);
      }

      let getUserListParam = {
        userName: inviteeUserNames,
      };

      let userChatRooms = await ApiCall.GetListOfRoomsWithUnreadMessagesV4(
        socket.handshake.headers.authorization,
        getUserListParam
      );

      if (tmpUsr) {
        server.to(tmpUsr.socketId).emit("userChatRooms", userChatRooms);
      }
    }
  );

  Commnads.set(
    "DeleteUserFromRoom",
    async (request, socket, server, client, acc) => {
      let roomName = request.data.roomName;
      let inviteeUserNames = request.data.inviteeUserNames;
      let apiParam = {
        roomName: roomName,
        inviteeUserNames: inviteeUserNames,
      };

      let AddUserToRoomRes = await ApiCall.DeleteUserFromRoom(
        socket.handshake.headers.authorization,
        apiParam
      );

      let tmpUsr = await RedisActions.getUserDetail(client, inviteeUserNames);

      if (tmpUsr) {
        let ss = server.sockets.sockets.get(tmpUsr.socketId);
        //let rooms = ss.client.leave(roomName);
        //ss.leave(roomName);
        //server.sockets.sockets.get(tmpUsr.socketId).leave(roomName);
        server.sockets.sockets[tmpUsr.socketId].leave("chat");
      }

      let getUserListParam = {
        userName: inviteeUserNames,
      };

      let userChatRooms = await ApiCall.GetListOfRoomsWithUnreadMessagesV4(
        socket.handshake.headers.authorization,
        getUserListParam
      );

      if (tmpUsr) {
        server.to(tmpUsr.socketId).emit("userChatRooms", userChatRooms);
      }
    }
  );
} catch (exception) {
  console.log(`${Common.DateNOW()} ERROR: ${exception.message}`);
}

// retry r
