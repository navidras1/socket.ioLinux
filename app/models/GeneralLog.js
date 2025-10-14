import os from 'os';
import { Common } from '../utils/Common.js';
export class GeneralLog {
    constructor() {
        this.SystemName = "NodejsSocket";
        this.EventDateTime = Common.DateNOW()
        this.PkEmployee = 0;
        this.UserName = "";
        this.EventLevel = "Info";
        this.ClientIp = "";
        this.MachineName = os.hostname();
        this.EventMessage = "";
        this.ErrorSource = "";
        this.ErrorClass = "";
        this.ErrorMethod = "";
        this.Exception = "";
        this.StackTrace = "";
        this.ControllerParam = "";
        this.Response = "";
    }

    setProps(pkEmployee, userName, eventLevel, clientIp, eventMessage, errorSource, errorMethod, exception, stackTrace, controllerParam, response) {
        this.PkEmployee = pkEmployee;
        this.UserName = userName;
        this.EventLevel = eventLevel;
        this.ClientIp = clientIp;
        this.EventMessage = eventMessage;
        this.ErrorSource = errorSource;
        this.ErrorMethod = errorMethod;
        this.Exception = exception;
        this.StackTrace = stackTrace;
        this.ControllerParam = controllerParam;
        this.Response = response;
    }
}