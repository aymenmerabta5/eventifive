import { protectedProcedure } from "../index";

export const privateData = protectedProcedure.handler(({ context }) => {
    return {
        message: "This is private",
        user: context.session?.user,
    };
});