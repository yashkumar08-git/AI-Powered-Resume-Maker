"use client";

import { useRef } from "react";
import type { CustomizeResumeOutput } from "@/ai/flows/tailor-resume";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Mail, Copy, FileImage, FileType } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


interface ResultsDisplayProps {
  result: CustomizeResumeOutput;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const coverLetterRef = useRef<HTMLDivElement>(null);

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
  
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
        title: "Copied to clipboard!",
    });
  };

  const downloadPdf = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (ref.current) {
      const doc = new jsPDF();
      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;
      const margin = 15;
      const textWidth = a4Width - (margin * 2);

      const text = ref.current.innerText;
      
      const splitText = doc.splitTextToSize(text, textWidth);

      let y = margin;
      splitText.forEach((line: string) => {
          if (y > a4Height - margin) {
              doc.addPage();
              y = margin;
          }
          doc.text(line, margin, y);
          y += 7; // Line height
      });

      doc.save(filename);
    }
  };

  const downloadImage = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (ref.current) {
      html2canvas(ref.current, { backgroundColor: '#ffffff' }).then((canvas) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const DocumentActions = ({ content, filename, contentRef }: { content: string, filename: string, contentRef: React.RefObject<HTMLDivElement> }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(content)}
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          downloadTextFile(content, `${filename}.txt`)
        }
      >
        <Download className="mr-2 h-4 w-4" />
        TXT
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadPdf(contentRef, `${filename}.pdf`)}
      >
        <FileType className="mr-2 h-4 w-4" />
        PDF
      </Button>
       <Button
        variant="outline"
        size="sm"
        onClick={() => downloadImage(contentRef, `${filename}.png`)}
      >
        <FileImage className="mr-2 h-4 w-4" />
        Image
      </Button>
    </div>
  );

  return (
    <div className="mt-12 w-full animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
      <Tabs defaultValue="resume" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex-1">
             <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Your Customized Documents
            </h2>
            <p className="text-muted-foreground mt-1">
                Your resume and cover letter are ready.
            </p>
          </div>
         
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="resume">
              <FileText className="mr-2 h-4 w-4" />
              Customized Resume
            </TabsTrigger>
            <TabsTrigger value="cover-letter">
              <Mail className="mr-2 h-4 w-4" />
              Cover Letter
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="resume">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle>Customized Resume</CardTitle>
                <CardDescription>
                  Optimized for the job description.
                </CardDescription>
              </div>
              <DocumentActions content={result.customizedResume} filename="customized-resume" contentRef={resumeRef} />
            </CardHeader>
            <CardContent className="p-0">
              <div ref={resumeRef} className="p-6 bg-background h-[600px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans text-foreground leading-relaxed">
                  {result.customizedResume}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cover-letter">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle>Cover Letter</CardTitle>
                <CardDescription>
                  A compelling letter to introduce yourself.
                </CardDescription>
              </div>
               <DocumentActions content={result.coverLetter} filename="cover-letter" contentRef={coverLetterRef} />
            </CardHeader>
            <CardContent className="p-0">
              <div ref={coverLetterRef} className="p-6 bg-background h-[600px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans text-foreground leading-relaxed">
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
