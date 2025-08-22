
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
import { Download, FileText, Mail, Copy, FileImage, FileType, Briefcase, GraduationCap, Star, UserCircle, MapPin, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";

interface ResultsDisplayProps {
  result: CustomizeResumeOutput;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const { customizedResume, coverLetter } = result;

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
  
  const copyToClipboard = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
        navigator.clipboard.writeText(ref.current.innerText);
        toast({
            title: "Copied to clipboard!",
        });
    }
  };

  const downloadPdf = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (ref.current) {
      html2canvas(ref.current, { scale: 2, backgroundColor: null }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let width = pdfWidth;
        let height = width / ratio;

        if (height > pdfHeight) {
          height = pdfHeight;
          width = height * ratio;
        }

        let position = 0;
        let pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = (canvas.width / pdfWidth) * pdfHeight;
        let pageCtx = pageCanvas.getContext('2d');
        let heightLeft = canvas.height;


        while (heightLeft > 0) {
          pageCtx?.drawImage(canvas, 0, -position, canvas.width, canvas.height);
          const pageImgData = pageCanvas.toDataURL('image/png');
          if (position > 0) {
            pdf.addPage();
          }
          pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          heightLeft -= pageCanvas.height;
          position += pageCanvas.height;
        }
        
        pdf.save(filename);
      });
    }
  };

  const downloadImage = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (ref.current) {
      html2canvas(ref.current, { scale: 2, backgroundColor: null }).then((canvas) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const DocumentActions = ({ contentRef, filename }: { contentRef: React.RefObject<HTMLDivElement>, filename: string }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(contentRef)}
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
            if (contentRef.current) {
                downloadTextFile(contentRef.current.innerText, `${filename}.txt`)
            }
        }}
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
         
          <div className="flex items-center gap-4">
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
        </div>
        <TabsContent value="resume">
          <Card className="shadow-none bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle>Customized Resume</CardTitle>
                <CardDescription>
                  Optimized for the job description.
                </CardDescription>
              </div>
              <DocumentActions filename="customized-resume" contentRef={resumeRef} />
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8 bg-transparent h-[800px] overflow-y-auto">
                <div ref={resumeRef} className="p-8 bg-white text-black shadow-lg rounded-lg max-w-4xl mx-auto font-sans">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b-2 border-gray-200 pb-4 mb-6">
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold text-gray-800">{customizedResume.name}</h1>
                      {customizedResume.professionalTitle && <p className="text-xl text-primary mt-1">{customizedResume.professionalTitle}</p>}
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p className="flex items-center gap-2">{customizedResume.contact}</p>
                        {customizedResume.location && <p className="flex items-center gap-2"><MapPin size={14}/> {customizedResume.location}</p>}
                        {customizedResume.website && <p className="flex items-center gap-2"><LinkIcon size={14}/> <a href={customizedResume.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{customizedResume.website}</a></p>}
                      </div>
                    </div>
                    {customizedResume.photoDataUri && (
                       <Image src={customizedResume.photoDataUri} alt="Profile Photo" width={100} height={100} className="rounded-full object-cover w-24 h-24" />
                    )}
                  </div>
                  
                  {/* Summary */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-700 border-b border-gray-200 pb-2 mb-2 flex items-center gap-2"><UserCircle/> Professional Summary</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">{customizedResume.summary}</p>
                  </div>

                  {/* Work Experience */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-700 border-b border-gray-200 pb-2 mb-2 flex items-center gap-2"><Briefcase/> Work Experience</h2>
                    {customizedResume.experience.map((exp, index) => (
                      <div key={index} className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{exp.title}</h3>
                        <div className="flex justify-between items-baseline">
                           <p className="text-md font-medium text-gray-700">{exp.company}</p>
                           <p className="text-sm text-gray-500">{exp.dates}</p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-line leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-700 border-b border-gray-200 pb-2 mb-2 flex items-center gap-2"><GraduationCap/> Education</h2>
                    {customizedResume.education.map((edu, index) => (
                      <div key={index} className="flex justify-between items-baseline">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                            <p className="text-md font-medium text-gray-700">{edu.school}</p>
                        </div>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-700 border-b border-gray-200 pb-2 mb-2 flex items-center gap-2"><Star/> Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {customizedResume.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cover-letter">
          <Card className="shadow-none bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div>
                <CardTitle>Cover Letter</CardTitle>
                <CardDescription>
                  A compelling letter to introduce yourself.
                </CardDescription>
              </div>
               <DocumentActions filename="cover-letter" contentRef={coverLetterRef} />
            </CardHeader>
            <CardContent className="p-0">
              <div ref={coverLetterRef} className="p-8 bg-white text-black shadow-lg rounded-lg max-w-4xl mx-auto font-sans h-[600px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans text-black leading-relaxed">
                  {coverLetter}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
