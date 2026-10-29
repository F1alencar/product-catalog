export function Loading() {
  return (
    <div role="status" aria-label="Carregando" className="flex flex-col items-center gap-4 p-8">
      <div className="size-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      <p className="text-base text-muted-foreground">Carregando...</p>
    </div>
  );
}
