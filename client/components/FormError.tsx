import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded px-3 py-2",
        className
      )}
    >
      <AlertCircle size={16} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p className={cn("text-xs text-red-300 mt-1", className)}>
      {error}
    </p>
  );
}
