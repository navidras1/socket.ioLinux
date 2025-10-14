import { requestValidator } from "./requestValidator.js";

export class isTypingValidator extends requestValidator {

    validate(data){
        if(data.userName==undefined){
            this.errorMessages.push("the userName propery is needed");
        }else{
            if(data.userName.trim()!==""){
                this.errorMessages.push("the userName propery must be initialize to empty string ''");
            }
        }

        this.checkHasError();
        return this.hasError;


    }

}