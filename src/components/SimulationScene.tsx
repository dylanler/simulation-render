"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import P5 component to avoid SSR issues
const P5Wrapper = dynamic(() => import('./P5Wrapper'), {
  ssr: false
});

export default function SimulationScene() {
  const [sceneDescription, setSceneDescription] = useState('');
  const [simulationCode, setSimulationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: sceneDescription }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.sketch) {
        setSimulationCode(data.sketch);
        console.log('Simulation Code:', data.sketch);
      } else {
        console.error('No sketch code returned from API');
      }
    } catch (error) {
      console.error('Error generating simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="scene-description" className="font-medium">
          Describe your simulation scene:
        </label>
        <textarea
          id="scene-description"
          value={sceneDescription}
          onChange={(e) => setSceneDescription(e.target.value)}
          className="p-3 border rounded-lg min-h-[100px] dark:bg-gray-800 dark:border-gray-700"
          placeholder="Example: rocket flying to the moon"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          {isLoading ? 'Generating...' : 'Generate Simulation'}
        </button>
      </form>
      {simulationCode && (
        <div className="w-full aspect-square border rounded-lg overflow-hidden">
          <P5Wrapper sketch={simulationCode} />
        </div>
      )}
    </div>
  );
}
