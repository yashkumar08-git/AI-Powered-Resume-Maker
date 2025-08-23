
"use client";

import { useRef, useState } from "react";
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
import { Download, FileText, Mail, Copy, FileImage, FileType, Briefcase, GraduationCap, Star, User, MapPin, Link as LinkIcon, Mail as MailIcon, Phone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";
import { TemplateSwitcher, type Template } from "@/components/TemplateSwitcher";
import "@/components/resume-templates/modern.css";
import "@/components/resume-templates/classic.css";
import "@/components/resume-templates/creative.css";
import { cn } from "@/lib/utils";


interface ResultsDisplayProps {
  result: CustomizeResumeOutput;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const { customizedResume, coverLetter } = result;
  const [activeTemplate, setActiveTemplate] = useState<Template>('modern');


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
    const element = ref.current;
    if (element) {
      html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        // These options help render the full content, not just the visible part
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
       }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        const imgHeight = pdfWidth / ratio;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = position - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save(filename);
      });
    }
  };

  const downloadImage = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    const element = ref.current;
    if (element) {
      html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
       }).then((canvas) => {
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
            <TemplateSwitcher
                activeTemplate={activeTemplate}
                onTemplateChange={setActiveTemplate}
              />
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
                <div ref={resumeRef} className={cn("p-12 bg-white text-gray-800 shadow-2xl rounded-lg max-w-4xl mx-auto font-sans leading-relaxed resume-container", `template-${activeTemplate}`)}>
                  {/* Header */}
                  <div className="flex items-center justify-between pb-6 mb-8 resume-header">
                    <div className="flex-1">
                      <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight resume-name">{customizedResume.name}</h1>
                      {customizedResume.professionalTitle && <p className="text-2xl text-primary font-semibold mt-2 resume-title">{customizedResume.professionalTitle}</p>}
                    </div>
                    {customizedResume.photoDataUri && (
                       <Image src={customizedResume.photoDataUri} alt="Profile Photo" width={120} height={120} className="rounded-full object-cover w-32 h-32 border-4 border-primary/50 shadow-md resume-photo" />
                    )}
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200 resume-contact-info">
                    {customizedResume.contact && <p className="flex items-center gap-3 text-sm"><MailIcon size={16} className="text-primary"/> {customizedResume.contact}</p>}
                    {customizedResume.location && <p className="flex items-center gap-3 text-sm"><MapPin size={16} className="text-primary"/> {customizedResume.location}</p>}
                    {customizedResume.website && <p className="flex items-center gap-3 text-sm"><Globe size={16} className="text-primary"/> <a href={customizedResume.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{customizedResume.website}</a></p>}
                  </div>
                  
                  {/* Summary */}
                  <div className="mb-8 resume-section">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4 flex items-center gap-3 resume-section-title"><User/> Professional Summary</h2>
                    <p className="text-base resume-section-content">{customizedResume.summary}</p>
                  </div>

                  {/* Work Experience */}
                  <div className="mb-8 resume-section">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4 flex items-center gap-3 resume-section-title"><Briefcase/> Work Experience</h2>
                    {customizedResume.experience.map((exp, index) => (
                      <div key={index} className="mb-6 resume-item">
                        <div className="flex justify-between items-baseline">
                           <h3 className="text-xl font-bold text-gray-800 resume-item-title">{exp.title}</h3>
                           <p className="text-base text-gray-600 font-medium resume-item-dates">{exp.dates}</p>
                        </div>
                        <p className="text-lg font-semibold text-primary resume-item-subtitle">{exp.company}</p>
                        <p className="mt-2 text-base whitespace-pre-line resume-item-description">{exp.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="mb-8 resume-section">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4 flex items-center gap-3 resume-section-title"><GraduationCap/> Education</h2>
                    {customizedResume.education.map((edu, index) => (
                      <div key={index} className="flex justify-between items-start mb-4 resume-item">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 resume-item-title">{edu.degree}</h3>
                            <p className="text-lg font-semibold text-primary resume-item-subtitle">{edu.school}</p>
                             {edu.percentage && <p className="text-base text-gray-600 mt-1 resume-item-gpa">Percentage/GPA: {edu.percentage}</p>}
                        </div>
                        <p className="text-base text-gray-600 font-medium resume-item-dates">{edu.year}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="resume-section">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4 flex items-center gap-3 resume-section-title"><Star/> Skills</h2>
                    <div className="flex flex-wrap gap-3 resume-skills">
                      {customizedResume.skills.map((skill, index) => (
                        <span key={index} className="bg-primary/10 text-primary-foreground font-semibold px-4 py-2 rounded-full text-base resume-skill-item">{skill}</span>
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
              <div className="p-8 bg-transparent h-[800px] overflow-y-auto">
                <div ref={coverLetterRef} className="p-12 bg-white text-gray-800 shadow-2xl rounded-lg max-w-4xl mx-auto font-sans leading-relaxed">
                  <pre className="text-base whitespace-pre-wrap font-sans">
                    {coverLetter}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
