export function Loading({ label = "Loading" }) {
  return (
    <div className="state state--loading" role="status">
      <span className="pulse-track" aria-hidden="true">
        <span className="pulse-dot" />
      </span>

      <p>{label}…</p>
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="state state--empty">
      <p className="state__title">{title}</p>

      {hint && <p className="state__hint">{hint}</p>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__title">{title}</p>

      {message && <p className="state__hint">{message}</p>}

      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
