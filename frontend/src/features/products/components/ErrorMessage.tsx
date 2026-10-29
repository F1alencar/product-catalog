interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="mb-4 rounded-md border border-error bg-error-background p-4"
    >
      <p className="text-sm font-medium text-error">{message}</p>
    </div>
  );
}
