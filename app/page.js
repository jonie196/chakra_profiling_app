'use client';
import { useEffect, useRef, useState } from 'react';

export default function ChakraQuiz() {
  const containerRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && containerRef.current) {
      import('./chakraQuiz.js').then(({ initChakraQuiz }) => {
        initChakraQuiz(containerRef.current.id);
        setInitialized(true);
      });
    }
  }, [initialized]);

  return <div id="chakraQuizContainer" ref={containerRef}></div>;
}