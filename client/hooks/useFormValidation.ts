import { useState, useCallback } from "react";
import { z } from "zod";

interface FormErrors {
  [key: string]: string;
}

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    async (data: unknown): Promise<{ valid: boolean; data?: T }> => {
      setIsValidating(true);
      try {
        const validated = schema.parse(data);
        setErrors({});
        return { valid: true, data: validated };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: FormErrors = {};
          error.errors.forEach((err) => {
            const path = err.path.join(".");
            newErrors[path] = err.message;
          });
          setErrors(newErrors);
        }
        return { valid: false };
      } finally {
        setIsValidating(false);
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return {
    errors,
    isValidating,
    validate,
    clearErrors,
    clearError,
  };
}
