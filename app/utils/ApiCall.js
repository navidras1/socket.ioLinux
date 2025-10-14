import axios from "axios";
import dotenv from "dotenv";
import https from "https";
import { Common } from "./Common.js";
export class ApiCall {
  GetUsersToChat(params) {}

  static VERSIONS = {
    1: "v1/",
    2: "v2/",
    3: "v3/",
    4: "v4/",
  };

  //const url = env + VERSIONS[versionApp] + 'asdkjasda'

  static async getChatLog(token) {
    const versionApp = 1;

    dotenv.config();

    const headers = {
      Authorization: token,
    };

    dotenv.config();

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/UserChatHistory";

    var res = await axios.post(chatMicroService, null, { headers: headers });

    //var res = await axios.post('http://localhost:5233/api/Chat/UserChatHistory', null, { "headers": headers });
    return res.data;
  }

  static async getUnreadChatLog(token) {
    var test = 55;

    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetUserUreadMessages";
    var res = await axios.post(chatMicroService, null, { headers: headers });
    //var res = await axios.post('http://localhost:5233/api/Chat/GetUserUreadMessages', null, { "headers": headers });
    return res.data;
  }

  static async UpdateMessagesToRead(token, fromUserName) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/UpdateUserToReadMessag";
    var res = await axios.post(
      chatMicroService,
      { userName: "", fromUserName: fromUserName },
      { headers: headers }
    );
    return res.data;
  }

  static async GeLastMessage(token, fromUser) {
    const headers = {
      Authorization: token,
    };
    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetLastMessage";
    var res = await axios.post(
      chatMicroService,
      {
        fromUser: fromUser,
        toUser: "",
      },
      { headers: headers }
    );
    return res.data;
  }

  static async ChatHistory(token, user, pageNo, pageSize) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/HistoryMessageOfUsers";
    var res = await axios.post(
      chatMicroService,
      {
        fromUser: user,
        toUser: "",
        pageNumber: pageNo,
        pageSize: pageSize,
      },
      { headers: headers }
    );
    return res.data;
  }

  static async getUsersToChat(
    token,
    pageNo,
    pageSize,
    userName,
    toUserName,
    client
  ) {
    // token = token.replace(/^bearer\s+/, "");
    // token = "Bearer " + token;

    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;
    const ServerIp = process.env.ServerIp;

    const empsForChat = ServerIp + "Employee/GetAllEmployeeForChat";

    var res = await axios.post(
      empsForChat,
      {
        pageNumber: pageNo,
        pageSize: pageSize,
        userName: userName,
        toUserName: toUserName,
      },
      { headers: headers }
    );

    var onlineUsers = await client.keys("*");

    for (
      let i = 0;
      i < res.data.getAllEmployeeForChatResponseItemViewModels.length;
      i++
    ) {
      var fromUser =
        res.data.getAllEmployeeForChatResponseItemViewModels[
          i
        ].userName.toLowerCase();
      var theLastMessage = await this.GeLastMessage(token, fromUser);
      res.data.getAllEmployeeForChatResponseItemViewModels[i].lastMessage =
        theLastMessage;
      res.data.getAllEmployeeForChatResponseItemViewModels[i].isOnline = false;

      for (var k = 0; k < onlineUsers.length; k++) {
        let ff = onlineUsers[k];
        if (ff == "n.rasouli") {
          let mm = 55;
        }
        if (
          res.data.getAllEmployeeForChatResponseItemViewModels[
            i
          ].userName.toLowerCase() === onlineUsers[k].toLowerCase()
        ) {
          res.data.getAllEmployeeForChatResponseItemViewModels[
            i
          ].isOnline = true;
        }
      }
    }

    return res.data;
  }

  static async sendPushNotification(token, users, title, body, data) {
    // token = token.replace(/^bearer\s+/, "");
    // token = "Bearer " + token;

    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;
    const ServerIp = process.env.ServerIp;

    const sendPushNotification =
      ServerIp + "Authentication/SendPushNotification";

    let theMessage = {
      users: users,
      title: title,
      body: body,
      data: data, //{"url":"privateChat"}
    };

    try {
      var res = await axios.post(sendPushNotification, theMessage, {
        headers: headers,
      });
      return res.data;
    } catch (ex) {
      console.log(`${Common.DateNOW()} push notification Error ${ex}`);
      return ex.message;
    }
  }

  static async CreatePrivateChatRoom(token, inviteeUserName) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/CreatePrivateChatRoom";
    var res = await axios.post(
      chatMicroService,
      {
        inviteeUserName: inviteeUserName,
      },
      { headers: headers }
    );
    return res.data;
  }

  static async GetUserRooms(token) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const GetUserRooms =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetUserRooms";
    var res = await axios.post(GetUserRooms, null, { headers: headers });
    return res.data;
  }

  static async GetListOfRoomsWithUnreadMessages(token) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const GetUserRooms =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetListOfRoomsWithUnreadMessages";
    var res = await axios.post(GetUserRooms, null, { headers: headers });
    return res.data;
  }

  static async GetRoomMessages(token, data) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const GetUserRooms =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetUsersChatroomMessages";
    data.userName = "";
    var res = await axios.post(GetUserRooms, data, { headers: headers });
    return res.data;
  }

  static async GetMastersOfContact(token) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const GetMastersOfContact =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "BackendUtility/GetMastersOfContact";

    var res = await axios.post(GetMastersOfContact, null, { headers: headers });
    return res.data;
  }

  static async CreateGeneralChatRoom(
    token,
    inviteeUserNames,
    chatRoomName,
    description
  ) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/CreateGeneralChatRoom";
    var res = await axios.post(
      chatMicroService,
      {
        inviteeUserNames: inviteeUserNames,
        chatRoomName: chatRoomName,
        description: description,
      },
      { headers: headers }
    );
    return res.data;
  }

  static async SetLastEmpLastSeen(token, lastSeendate) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/SetLastEmpLastSeen";
    var res = await axios.post(
      chatMicroService,
      {
        lastSeenDate: lastSeendate,
      },
      { headers: headers }
    );
    return res.data;
  }

  static async GetLastSeenOfEmp(token, userName) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetLastSeenOfEmp";
    var res = await axios.post(
      chatMicroService,
      {
        userName: userName,
      },
      { headers: headers }
    );
    return res.data;
  }

  static async CountOfUnreadMessage(token, fromUserName, toUserName) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const GetMastersOfContact =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "BackendUtility/CountOfUnreadMessage";

    var res = await axios.post(
      GetMastersOfContact,
      {
        fromUserName: fromUserName,
        toUserName: toUserName,
      },
      { headers: headers }
    );
    return res.data;
  }

  static async GetEmployeeDetail(token, userName) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const GetEmpDetail =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "BackendUtility/GetEmployeeDetail";

    var res = await axios
      .post(
        GetEmpDetail,
        {
          userName: userName,
        },
        { headers: headers }
      )
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
    return res.data;
  }

  static async GetUserChatHistoryV3(token, timeStamp) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 2;

    /// rerun

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetUserChatHistoryV3";
    var res = await axios.post(
      chatMicroService,
      {
        fromTimeStamp: timeStamp,
      },
      { headers: headers }
    );
    return res.data;
  }

  static async Pooling(token, timeStamp) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/Pooling";
    var res = await axios.post(
      chatMicroService,
      {
        fromTimeStamp: timeStamp,
      },
      { headers: headers }
    );
    return res.data;
  }

  static async HistoryChatOfUsers(token, userGuidMap) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/HistoryChatOfUsers";
    var res = await axios.post(chatMicroService, userGuidMap, {
      headers: headers,
    });
    return res.data;
  }

  static async GetFileDetail(token, request) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetFileDetail";
    var res = await axios.post(chatMicroService, request, { headers: headers });
    return res.data;
  }

  static async CanSendMessageToRoom(token, request) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Admin/CanSendMessageToRoom";
    var res = await axios.post(chatMicroService, request, { headers: headers });
    return res.data;
  }

  static async CanSendMessageToRoomV2(token, request) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 2;

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Admin/CanSendMessageToRoom";
    var res = await axios.post(chatMicroService, request, { headers: headers });
    return res.data;
  }

  static async HistoryChatOfUsersV2(token, userGuidMap) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 2;

    /// rerun

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/HistoryChatOfUsers";
    var res = await axios.post(chatMicroService, userGuidMap, {
      headers: headers,
    });
    return res.data;
  }

  static async DeletePrivateChat(token, messageGuids) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/DeletePrivateChat";
    var res = await axios.post(chatMicroService, messageGuids, {
      headers: headers,
    });
    return res.data;
  }

  static async RoomMembers(token, RoomDetail) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/RoomMembers";
    var res = await axios.post(chatMicroService, RoomDetail, {
      headers: headers,
    });
    return res.data;
  }

  static async RoomMembersWithNotif(token, RoomDetail) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/RoomMembersWithNotif";
    var res = await axios.post(chatMicroService, RoomDetail, {
      headers: headers,
    });
    return res.data;
  }

  static async RoomMembersWithNotifV2(token, RoomDetail) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 2;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/RoomMembersWithNotif";
    var res = await axios.post(chatMicroService, RoomDetail, {
      headers: headers,
    });
    return res.data;
  }

  static async UpdateMessageToReadFromTo(token, param) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/UpdateMessageToReadFromTo";
    var res = await axios.post(chatMicroService, param, {
      headers: headers,
    });
    return res.data;
  }

  static async InstertToOffLineAction(token, param) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/InstertToOffLineAction";
    var res = await axios.post(chatMicroService, param, {
      headers: headers,
    });
    return res.data;
  }

  static async CheckOfflineActions(token) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/CheckOfflineActions";
    var res = await axios.post(chatMicroService, null, {
      headers: headers,
    });

    let actionResult = res.data.result;
    let objs = actionResult.map((x) => JSON.parse(x));
    return objs;
  }

  static async DeleteChatOffline(token, param) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/DeleteChatOffline";
    var res = await axios.post(chatMicroService, param, {
      headers: headers,
    });

    let actionResult = res.data;
    return actionResult;
  }

  static async MakeOfflineActionDone(token) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/MakeOfflineActionDone";
    var res = await axios.post(chatMicroService, null, {
      headers: headers,
    });

    let actionResult = res.data;
    return actionResult;
  }

  static async AddUserToRoom(token, param) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/AddUserToRoom";
    var res = await axios.post(chatMicroService, param, {
      headers: headers,
    });

    let actionResult = res.data;
    return actionResult;
  }

  static async DeleteUserFromRoom(token, param) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 1;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/DeleteUsersFromRoom";
    var res = await axios.post(chatMicroService, param, {
      headers: headers,
    });

    let actionResult = res.data;
    return actionResult;
  }

  static async GetListOfRoomsWithUnreadMessagesV4(token, param) {
    const headers = {
      Authorization: token,
    };
    dotenv.config();
    const versionApp = 4;

    /// rerun refresh

    const chatMicroService =
      process.env.chatMicroServiceServer +
      this.VERSIONS[versionApp] +
      "Chat/GetListOfRoomsWithUnreadMessages";
    var res = await axios.post(chatMicroService, param, {
      headers: headers,
    });

    let actionResult = res.data;
    return actionResult;
  }
}
