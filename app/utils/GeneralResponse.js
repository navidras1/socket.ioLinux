
export class GeneralResponse {
    constructor() {
        this._hasError = false;
        this._message = "";
        this._technicalMessage = "";
    }

    set HasError(value) {
        this._hasError = value;
    }

    get HasError() {
        return this._hasError;
    }

    set Message(value) {
        this._message = value;
    }
    get Message() {
        return this._message;
    }

    set TechnicalMessage(value){
        this._technicalMessage=value;
    }

    get TechnicalMessage(){
        return this._technicalMessage;
    }


}