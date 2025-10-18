import amqp from "amqplib";

import { createServer } from "http";
import { commandOptions, createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import config from "./config.js";
import dotenv from "dotenv";
import { Actions } from "./utils/CheckJwt.js";
import { RabbitMqAction } from "./utils/RabbitMqAction.js";
import { RedisActions } from "./utils/RedisActions.js";
import axios, { all } from "axios";
import { ApiCall } from "./utils/ApiCall.js";
import { Common } from "./utils/Common.js";
import { ChatMessage } from "./models/ChatMessage.js";
import { ChatStatus } from "./utils/constant.js";
import { Commnads } from "./utils/Commands.js";
import { GeneralLog } from "./models/GeneralLog.js";
import express from "express";
import { log } from "console";
import { json } from "stream/consumers";
import cors from "cors";
//import { emit } from "process";

try {
  const app = express();
  const httpServer = createServer(app);
  const server = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Authorization", "Access-Control-Allow-Origin"],
      credentials: true,
    },
  });

  dotenv.config();
  const userTimeToLive = process.env.userTimeToLive;

  var redisIP = process.env.RedisIP;

  const client = createClient({ url: redisIP });
  client.on("error", (err) =>
    console.log(`${Common.DateNOW()} Redis Client Error ${err}`)
  );
  await client.connect();
  if (process.env.TheEnv == "development") {
    await client.select(1);
  }

  //client.configSet("notify-keyspace-events", "Ex");
  const sub = client.duplicate();
  sub.connect();
  if (process.env.TheEnv == "development") {
    await sub.select(1);
  }

  httpServer.listen(3000);

  var onlineUserNames = [];
  var rsUsers = [];

  server.use(function (socket, next) {
    // if (socket.request.headers.cookie) return next();
    // let err  = new Error('Authentication error');
    // err.data = { type : 'authentication_error' };
    // next(err);
    next();
  });
  let theSocket = {};

  server.on("connection", async (socket) => {
    theSocket = socket;
    socket.on("connect_error", (err) =>
      console.log(`${Common.DateNOW()} errrr ${err}`)
    );
    await client.del("backup1");
    await client.del("backup2");
    await client.del("backup3");
    await client.del("backup4");
    //let TestResss= Commnads.get("Test")(5,6);

    console.log(`${Common.DateNOW()} Client connected [id=${socket.id}]`);

    var generalLog = new GeneralLog();
    generalLog.EventMessage = `${socket.handshake.headers.authorization}`;

    let acc = new Actions();

    RabbitMqAction.PublishGeneralLog(generalLog);
    await acc.checkJwt(socket.handshake.headers.authorization);

    if (acc.HasError) {
      //await RedisActions.wait(200);
      await socket.emit("generalMessage", acc.Message);
      console.log(`${Common.DateNOW()} ${acc.Message}`);
      socket.disconnect(true);
      return;
    }

    await RedisActions.checkIfUserSocketExists(server, client, acc.UserName);

    try {
      ///find the rooms that user is joined before
      var userChatRooms = await ApiCall.GetListOfRoomsWithUnreadMessages(
        socket.handshake.headers.authorization
      );
      userChatRooms.map((roomName) => socket.join(roomName.chatroomname));

      socket.emit("userChatRooms", userChatRooms);
    } catch (exception) {
      socket.emit("generalMessage", `ERROR: ${exception.message}`);
    }

    // let foundSocket=  server.sockets.sockets.get("");
    // foundSocket.disconnect(true)
    socket.username = acc.UserName;
    socket.userId = acc.UserId;
    socket.fullName = acc.fullName;

    socket.UserToCare = "";
    var userDetail = { userId: acc.UserId, socketId: socket.id };
    console.log(
      `${Common.DateNOW()} count of online users by socketio ${
        server.sockets.sockets.size
      }`
    );
    // if (acc.UserName == "hamed") {
    //     await client.set(acc.UserName, JSON.stringify(userDetail));
    // }
    // else {
    await client.setEx(
      acc.UserName,
      userTimeToLive,
      JSON.stringify(userDetail)
    );

    await client.set(acc.UserName + ",ToEx", socket.id);

    // }

    onlineUserNames = await client.keys("*[^,ToEx,Backup]");
    rsUsers = onlineUserNames.map((userName) => ({ username: userName }));
    //await RedisActions.wait(200);
    await socket.emit("getUsers", rsUsers);

    await socket.emit("generalMessage", `Welcome ${acc.UserName}`);
    await socket.emit("myInfo", {
      userName: acc.UserName,
      userId: acc.UserId,
      socketId: socket.id,
    });
    //socket.emit("messageHistory", chatLogRes);
    //socket.emit("unreadMessages", unreadMessages);

    onlineUserNames.forEach(async (userName) => {
      let tmpUsr = await RedisActions.getUserDetail(client, userName);
      if (tmpUsr) {
        socket.to(tmpUsr.socketId).emit("getUsers", rsUsers);
      }
    });

    if (
      socket.username.toLowerCase() == "came" ||
      socket.username.toLowerCase() == "morteza" ||
      socket.username.toLowerCase() == "hamed"
    ) {
      socket.join("PickupRoom");
      socket.emit("generalMessage", "you automatically joined PickupRoom");
      socket
        .to("PickupRoom")
        .emit("PickupRoom", `${socket.username} joined The room`);
    }

    // initialize this client's sequence number
    console.log(
      `${Common.DateNOW()} Client connected [userName=${socket.username}]`
    );

    sub.subscribe("__keyevent@0__:expired", async (thekey) => {
      try {
        let allSockets = server.sockets.sockets;
        let FoundSocketId = await client.get(thekey + ",ToEx");
        let theFoundSocket = allSockets.get(FoundSocketId);
        theFoundSocket.disconnect(true);
        await client.del(thekey + ",ToEx");
      } catch (ex) {
        socket.emit("generalMessage", `${ex.message}`);
      }
    });
    await Commnads.get("GetMastersOfContact")(
      { data: { isOnline: true } },
      socket,
      server,
      client,
      acc
    );

    await Commnads.get("GetCaredMastersOfContact")(
      { data: { isOnline: true } },
      socket,
      server,
      client,
      acc
    );

    await Commnads.get("CheckOffline")(null, socket, server, client, acc);
    await Commnads.get("MakeOfflineActionDone")(
      null,
      socket,
      server,
      client,
      acc
    );

    socket.on("disconnect", async () => {
      await client.del(socket.username);
      await client.del(`${socket.username},ToEx`);
      try {
        await ApiCall.SetLastEmpLastSeen(
          socket.handshake.headers.authorization,
          Date.now().toString()
        );
      } catch (ex) {}

      onlineUserNames = await client.keys("*[^,ToEx]");
      rsUsers = onlineUserNames.map((x) => ({ username: x }));
      onlineUserNames.forEach(async (userName) => {
        let tmpUsr = await RedisActions.getUserDetail(client, userName);
        if (tmpUsr) {
          socket.to(tmpUsr.socketId).emit("getUsers", rsUsers);
        }
      });

      console.log(`${Common.DateNOW()} Client gone [id=${socket.id}]`);
      console.info(
        `${Common.DateNOW()} Client gone log info [id=${socket.id}]`
      );
      console.log(
        `${Common.DateNOW()} Client gone [userName=${socket.username}]`
      );
      try {
        await Commnads.get("GetMastersOfContact")(
          { data: { isOnline: false } },
          socket,
          server,
          client,
          acc
        );

        await Commnads.get("GetCaredMastersOfContact")(
          { data: { isOnline: false } },
          socket,
          server,
          client,
          acc
        );
      } catch (ex) {}
    });
    socket.on("upload", (file, callback) => {
      console.log(file); // <Buffer 25 50 44 ...>
      // save the content to the disk, for example
      readFileSync("/tmp/upload", file, (err) => {
        callback({ message: err ? "failure" : "success" });
      });
    });

    socket.on("chat", async function (request, callback) {
      await client.expire(socket.username, userTimeToLive);

      let acc = new Actions();
      await acc.checkJwt(socket.handshake.headers.authorization);

      if (acc.HasError) {
        //console.log(exception);
        socket.emit("generalMessage", acc.Message);
        console.log(`${Common.DateNOW()} ${acc.Message}`);
        socket.disconnect(true);
        return;
      }

      try {
        if (!request.commandName) {
          await socket.emit("generalMessage", "commandName is needed");
          throw new Error("commandName is needed");
        } else {
          var validationRes = await Commnads.get(request.commandName)(
            request,
            socket,
            server,
            client,
            acc
          );
          if (callback) {
            callback({
              status: "ok",
              result: validationRes,
            });
          }
        }
      } catch (exception) {
        socket.emit("generalMessage", `${JSON.stringify(request)}`);
        socket.emit("generalMessage", exception.message);
        console.log(`${Common.DateNOW()} ERROR: ${exception.message}`);
        console.log(`${Common.DateNOW()} ERROR: ${JSON.stringify(request)}`);
        if (callback) {
          callback({
            status: "error",
          });
        }
      }
    });
  });

  app.use(express.json());

  app.post("/api/privateChat", async (req, res) => {
    let apiRes = {
      status: "ok",
      result: {},
    };
    try {
      var headers = req.headers;
      let auth = headers.authorization;
      let body = req.body;
      console.log("api log req body: " + JSON.stringify(req.body));
      console.log("api log req auth: " + headers.authorization);

      let acc = new Actions();

      await acc.checkJwt(auth);

      console.log("api log req userName: " + acc.UserName);

      var userDetails = await RedisActions.getUserDetail(client, acc.UserName);
      let socketId = userDetails.socketId;

      console.log("api log req socketId: " + socketId);

      let socket = server.sockets.sockets.get(socketId);

      var commandResult = await Commnads.get("privateChat")(
        req.body,
        socket,
        server,
        client,
        acc
      );
      apiRes.result = commandResult;
    } catch (exeception) {
      console.error(exeception, exeception.stack);

      apiRes.status = "error";
      apiRes.result = exeception.message;
    }
    res.send(apiRes);
    //res.end(result);
  });

  app.post("/api/messageToChatRoom", async (req, res) => {
    let apiRes = {
      status: "ok",
      result: {},
    };
    try {
      var headers = req.headers;
      let auth = headers.authorization;
      let body = req.body;
      console.log("api log req body: " + JSON.stringify(req.body));
      console.log("api log req auth: " + headers.authorization);

      let acc = new Actions();

      await acc.checkJwt(auth);

      console.log("api log req userName: " + acc.UserName);

      var userDetails = await RedisActions.getUserDetail(client, acc.UserName);
      let socketId = userDetails.socketId;

      console.log("api log req socketId: " + socketId);

      let socket = server.sockets.sockets.get(socketId);

      var commandResult = await Commnads.get("messageToChatRoom")(
        req.body,
        socket,
        server,
        client,
        acc
      );
      apiRes.result = commandResult;
    } catch (exeception) {
      console.error(exeception, exeception.stack);

      apiRes.status = "error";
      apiRes.result = exeception.message;
    }
    res.send(apiRes);
    //res.end(result);
  });
} catch (exception) {
  console.log(`${Common.DateNOW()} ERROR: ${exception.message}`);
  //this test
}
