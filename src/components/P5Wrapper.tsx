"use client";

import { useEffect, useRef } from 'react';
import type p5 from 'p5';

interface P5WrapperProps {
  sketch: string;
}

export default function P5Wrapper({ sketch }: P5WrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamic import of p5
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;

      // Clean up previous instance
      if (p5Instance.current) {
        p5Instance.current.remove();
      }

      try {
        // Evaluate the sketch string to get a function
        const sketchFunction = eval(`(${sketch})`);
        
        // Create new p5 instance
        p5Instance.current = new p5(sketchFunction, containerRef.current);
      } catch (error) {
        console.error('Error creating p5 instance:', error);
      }
    });

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
      }
    };
  }, [sketch]);

  return <div ref={containerRef} className="w-full h-full" />;
}
