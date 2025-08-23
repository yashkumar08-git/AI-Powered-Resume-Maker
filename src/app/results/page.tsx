
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomizeResumeOutput } from "@/ai/flows/tailor-resume";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { LoadingState } from "@/components/LoadingState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<CustomizeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("resumeResult");
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
      } catch (error) {
        console.error("Failed to parse resume result:", error);
        // Handle corrupted data, maybe redirect back
        router.push("/");
      }
    } else {
      // No result found, maybe redirect back to home
      router.push("/");
    }
    setIsLoading(false);
  }, [router]);

  const handleCreateNew = () => {
    sessionStorage.removeItem("resumeResult");
    router.push("/");
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16">
        <LoadingState />
      </div>
    );
  }

  if (!result) {
     return (
      <div className="container mx-auto px-4 py-8 md:py-16 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>No Resume Data Found</CardTitle>
            <CardDescription>
              We couldn't find any generated resume data. Please go back and create one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <ResultsDisplay result={result} onStartOver={handleCreateNew} />
    </div>
  );
}
