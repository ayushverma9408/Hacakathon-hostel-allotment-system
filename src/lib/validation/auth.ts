import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  // bcrypt only considers the first 72 bytes; reject longer UTF-8 values so
  // distinct passwords can never silently compare as the same truncated input.
  password: z.string().min(14).max(128).refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Password must be no more than 72 bytes when UTF-8 encoded."
  )
});
