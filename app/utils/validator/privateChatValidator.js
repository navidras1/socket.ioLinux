import { requestValidator } from "./requestValidator.js";
export class privateChatValidator extends requestValidator{
    

    validate(object){
        if(!object.to){
           
            this.errorMessages.push("the to propery is needed");
        }


        if(typeof object.message !=="string"){
            this.errorMessages.push("the Message propery is needed");
        }

        if(object.isRtl==undefined){
            this.errorMessages.push("the isrtl propery is needed");
        }

        if(!object.clientTime){
            this.errorMessages.push("the clientTime propery is needed");
        }
        // else{
        //     if(object.Message.length==0){
        //         this.errorMessages.push("the Messages propery  length can not be 0");
        //     }
        //     else{
        //         object.Messages.forEach(i => {
        //             if(i.Message==undefined || i.IsRtl==undefined){
        //                 this.errorMessages.push("the Message and IsRtl propery is needed");
        //             }
        //             if(i.Message==null || i.Message.trim()==""){
        //                 this.errorMessages.push("Message propery must contain string value");

        //             }
        //             if(typeof i.IsRtl != 'boolean'){
        //                 this.errorMessages.push("IsRtl propery must be boolean");

        //             }
        //         });
        //     }

        // }

        

        this.checkHasError();
        return this.hasError;

    }
}