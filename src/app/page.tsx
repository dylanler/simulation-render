import SimulationScene from '@/components/SimulationScene';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <main className="flex flex-col items-center max-w-4xl w-full mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          P5.js Simulation Generator
        </h1>
        <div className="w-full max-w-2xl">
          <SimulationScene />
        </div>
      </main>
    </div>
  );
}
