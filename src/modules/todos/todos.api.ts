import { dbMiddleware } from "#/shared/middleware/db.middleware";
import { createServerFn } from "@tanstack/react-start";

export const getTodosServerFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    return context.db.todo.findMany()
  })
