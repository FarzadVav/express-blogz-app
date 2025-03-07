import { ZodSchema } from "zod";

export const zodValidation = <T>(schema: ZodSchema<T>, data: unknown): string[] | undefined => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: string[] = []

    const flattenErrors = result.error.flatten().fieldErrors
    Object.keys(flattenErrors).forEach((key) => {
      const fieldError = flattenErrors[key as keyof typeof flattenErrors];
      if (Array.isArray(fieldError)) {
        errors.push(fieldError.join(", "));
      }
    });

    return errors
  }

  return undefined;
};
