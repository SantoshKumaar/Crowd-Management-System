import customAxios from "../interceptor/http-interceptor";
import { AppUrl } from "../config/AppUrl";

export const SimulationService = {

  start: () => {
    return customAxios.get(AppUrl.simStart);
  },

  stop: () => {
    return customAxios.get(AppUrl.simStop);
  },
};



