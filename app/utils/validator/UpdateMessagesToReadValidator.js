import { requestValidator } from "./requestValidator.js";

export class UpdateMessagesToReadValidator extends requestValidator{
    validate(data) {
        if (data.fromUserName == undefined) {
            this.errorMessages.push("the fromUserName propery is needed");
        } else {

            if(typeof data.fromUserName !=="string"){
                this.errorMessages.push("the fromUserName propery must be string");

            }

            if (data.fromUserName.toString().trim() === "") {
                this.errorMessages.push("the fromUserName propery must contain a user name");
            }
        }

        this.checkHasError();
        return this.hasError;
    }
}