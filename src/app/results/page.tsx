
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import type { TailorResumeOutput } from '@/ai/flows/tailor-resume';
import { LoadingState } from '@/components/LoadingState';

export default function ResultsPage() {
  const [result, setResult] = useState<(TailorResumeOutput & { id?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This code runs only on the client
    const storedResult = localStorage.getItem('resumeResult');
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        // Basic validation to ensure we have something to show
        if(parsedResult.customizedResume || parsedResult.coverLetter) {
            setResult(parsedResult);
        } else {
            console.error("Parsed result is empty, redirecting.");
            router.push('/');
        }
      } catch (error) {
        console.error("Failed to parse resume result from localStorage", error);
        // Handle error, maybe redirect back to home
        router.push('/');
      }
    } else {
      // If there's no result, redirect to the home page to start over
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleStartOver = () => {
    localStorage.removeItem('resumeResult');
    router.push('/');
  };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 md:py-16">
            <LoadingState />
        </div>
    );
  }

  if (!result) {
    // This can be a fallback for when the redirect hasn't happened yet
    // or if localStorage fails.
    return (
         <div className="container mx-auto px-4 py-8 md:py-16">
            <p>No resume data found. Redirecting...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
        <ResultsDisplay result={result} onStartOver={handleStartOver} />
    </div>
  );
}
