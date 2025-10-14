export class requestValidator{
    constructor(){
        this.hasError=false;
        this.errorMessages= [];
    }

    checkHasError(){
        if(this.errorMessages.length>0){
            this.hasError=true;
        }
    }
}