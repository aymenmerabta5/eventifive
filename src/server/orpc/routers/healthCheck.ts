import { publicProcedure } from "../index";

export const healthCheck = publicProcedure.handler(() => {
    return "OK";
});