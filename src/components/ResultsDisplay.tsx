"use client";

import type { TailorResumeOutput } from "@/ai/flows/tailor-resume";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Mail } from "lucide-react";

interface ResultsDisplayProps {
  result: TailorResumeOutput;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-12 w-full">
      <Tabs defaultValue="resume" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Your Tailored Documents
          </h2>
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="resume">
              <FileText className="mr-2 h-4 w-4" />
              Tailored Resume
            </TabsTrigger>
            <TabsTrigger value="cover-letter">
              <Mail className="mr-2 h-4 w-4" />
              Cover Letter
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="resume">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tailored Resume</CardTitle>
                <CardDescription>
                  Optimized for the job description.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  downloadTextFile(result.tailoredResume, "tailored-resume.txt")
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-secondary/30 h-[500px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-body text-foreground">
                  {result.tailoredResume}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cover-letter">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cover Letter</CardTitle>
                <CardDescription>
                  A compelling letter to introduce yourself.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  downloadTextFile(result.coverLetter, "cover-letter.txt")
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-secondary/30 h-[500px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-body text-foreground">
                  {result.coverLetter}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
