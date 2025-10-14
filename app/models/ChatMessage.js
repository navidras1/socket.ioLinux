export class ChatMessage {
  constructor() {
    this.messages = [];
    this.fromChatRoom = "";
    this.fromUserName = "";
    this.createDate = Date.now();
    this.forwardedBy = "";
  }

  setProps(fromChatRoom, fromUserName, messages, forwardedBy) {
    this.messages = messages;
    this.fromChatRoom = fromChatRoom;
    this.fromUserName = fromUserName;
    this.forwardedBy = forwardedBy;
  }
}
