export const FancyLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>

      <p className="text-muted-foreground animate-pulse text-sm">Carregando seus agendamentos...</p>
    </div>
  )
}
