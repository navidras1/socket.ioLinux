import { ApiCall } from "../utils/ApiCall.js";
import { RedisActions } from "../utils/RedisActions.js";

export class PrivateChatResponse {
  constructor() {
    this.fromUserName = "";
    this.lastMessage = "";
    this.createDate = Date.now();
    this.isRtl = false;
    //this.toUserName= toUserName;
    this.countOfUnreadMessage = 0;
    this.pkEmployee = 0;
    this.fullName = "";
    this.sentUser = "";
    this.status = "sent";
    this.lastMessageId = "";
    this.attachment = null;
    this.roomType = "private";
    this.forwardedBy = "";
    this.replyOf = {};

    //this.countOfUnreadMessage =
  }

  async setProps(
    fromUserName,
    fromPkEmployee,
    toUserName,
    lastmessage,
    isRtl,
    token,
    fullName,
    sentUser,
    lastMessageId,
    attament,
    forwardedBy,
    replyOf
  ) {
    this.fromUserName = fromUserName;
    //this.toUserName= toUserName;
    this.createDate = Date.now();
    this.lastMessage = lastmessage;
    this.isRtl = isRtl;
    //await RedisActions.wait(3000);

    var countOfUnreadObj = await ApiCall.CountOfUnreadMessage(
      token,
      fromUserName,
      toUserName
    );
    this.countOfUnreadMessage = countOfUnreadObj.countOfUnreadMessage;
    this.fullName = fullName;
    this.pkEmployee = fromPkEmployee;
    this.sentUser = sentUser;
    this.lastMessageId = lastMessageId;
    this.attachment = attament;
    this.forwardedBy = forwardedBy;
    this.replyOf = replyOf;
  }
}
