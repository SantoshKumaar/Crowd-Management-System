import customAxios from "../interceptor/http-interceptor";
import { AppUrl } from "../config/AppUrl";


export const AuthService = {
  login: (credentials) => {
    console.log('AuthService: Sending login request to', AppUrl.login);
    return customAxios.post(AppUrl.login, credentials);
  },
};

