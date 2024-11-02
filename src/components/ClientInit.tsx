"use client";

import { useEffect } from 'react';

export default function ClientInit() {
  useEffect(() => {
    // Any client-side initialization can go here
    document.body.classList.add('client-initialized');
  }, []);

  return null;
}
