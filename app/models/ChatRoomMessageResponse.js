export class ChatRoomMessageResponse {
  constructor() {
    this.chatRoomName = "";
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
    this.roomType = "";
    this.forwardedBy = "";
    this.replyOf = {};

    //this.countOfUnreadMessage =
  }

  setProps(
    chatRoomName,
    roomType,
    fromUserName,
    lastMessage,
    isRtl,
    pkEmployee,
    fullName,
    lastMessageId,
    attachment,
    forwardedBy,
    replyOf
  ) {
    this.fromUserName = fromUserName;
    this.lastMessage = lastMessage;
    this.createDate = Date.now();
    this.isRtl = isRtl;
    this.pkEmployee = pkEmployee;
    this.fullName = fullName;
    //this.sentUser = sentUser;
    this.lastMessageId = lastMessageId;
    this.attachment = attachment;
    this.chatRoomName = chatRoomName;
    this.roomType = roomType;
    this.forwardedBy = forwardedBy;
    this.replyOf = replyOf;
  }
}
