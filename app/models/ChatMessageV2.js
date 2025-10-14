export class ChatMessageV2 {
    constructor() {
      this.messages = [];
      this.fromChatRoomId = "";
      this.fromUserName = "";
      this.createDate = Date.now();
      this.forwardedBy = "";
    }
  
    setProps(fromChatRoomId, fromUserName, messages, forwardedBy) {
      this.messages = messages;
      this.fromChatRoomId = fromChatRoomId;
      this.fromUserName = fromUserName;
      this.forwardedBy = forwardedBy;
    }
  }