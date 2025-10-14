export class getUsersToChatValidator{
    validate(data){

        if(data.page==undefined){
            this.errorMessages.push("the page propery is needed");
        }
        else{
            if (typeof data.page !=="number"){
                this.errorMessages.push("the page propery must be number");
            }

            if(data.page<1){
                this.errorMessages.push("the page propery value must be at least 1");
            }

        }

        if(data.pageSize==undefined){
            this.errorMessages.push("the page propery is needed");
        }
        else{
            if (typeof data.pageSize !=="number"){
                this.errorMessages.push("the pageSize propery must be number");
            }
            if(data.pageSize<1){
                this.errorMessages.push("the pageSize propery value must be at least 1");

            }
        }

        


        



        this.checkHasError();
        return this.hasError;

    }
}