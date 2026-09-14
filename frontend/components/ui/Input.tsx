import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`
          w-full
          rounded-md
          border
          bg-surface
          px-3.5
          py-2.5
          text-sm
          text-text
          placeholder:text-text-muted
          transition-colors
          focus:border-primary
          focus:outline-none
          focus:ring-2
          focus:ring-primary-light
          disabled:cursor-not-allowed
          disabled:bg-surface-muted
          disabled:text-text-muted
          ${
            error
              ? "border-danger focus:border-danger focus:ring-danger-light"
              : "border-border-strong"
          }
          ${className}
        `}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
              ? `${inputId}-helper`
              : undefined
        }
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-danger"
        >
          {error}
        </p>
      )}

      {!error && helperText && (
        <p
          id={`${inputId}-helper`}
          className="text-sm text-text-muted"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}