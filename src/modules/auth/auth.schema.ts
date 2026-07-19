import z from "zod";
/** Used by an admin to create a new account — public self-registration is disabled. */
export const CreateUserSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	password: z.string().min(8),
});
export const LoginUserSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});
