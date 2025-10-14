import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { GeneralResponse } from "./GeneralResponse.js";
import { ApiCall } from "./ApiCall.js";

export class Actions extends GeneralResponse {
  constructor() {
    super();
    this._userName = "un";
    this._userId = "ff";
    this.fullName = "";
  }

  set UserName(value) {
    this._userName = value;
  }
  get UserName() {
    return this._userName;
  }

  set UserId(value) {
    this._userId = value;
  }
  get UserId() {
    return this._userId;
  }

  // async errorHandler(someFunction) {
  //     return new Promise(async (resolve) => {
  //         try {
  //             const result = await someFunction()

  //             resolve({
  //                 success: true,
  //                 response: result
  //             });
  //         } catch (e) {
  //             resolve({
  //                 success: false,
  //                 response: e
  //             })
  //         }
  //     })
  // }

  async checkJwt(token) {
    try {
      dotenv.config();
      const JwtSecret = process.env.JwtSecret;
      token = token.replace(/^bearer\s+/, "");
      token = token.replace("Bearer ", "");
      this.UserName = "navid";
      let name = "";
      let id = "";
      await jwt.verify(token, JwtSecret, async function (err, decoded) {
        name =
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

        id =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
      });
      this.UserName = name.toLowerCase();
      this.UserId = id;
      // let fullNameApiRes = await ApiCall.GetEmployeeDetail(
      //   "bearer " + token,
      //   this.UserName
      // );
      this.fullName = name;
    } catch (ex) {
      this.HasError = true;
      this.Message = ex.message;
      this.TechnicalMessage = ex.message;
    }
  }
}
