
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
import { useAuth } from "@/hooks/use-auth";


interface ResultsDisplayProps {
  result: CustomizeResumeOutput;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const { customizedResume, coverLetter } = result;
  const [activeTemplate, setActiveTemplate] = useState<Template>('modern');
  const { user } = useAuth();


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
      // Temporarily override styles for PDF generation
      const originalWidth = element.style.width;
      element.style.width = '210mm';

      html2canvas(element, { 
        scale: 3, // Increase scale for better quality
        backgroundColor: '#ffffff',
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
       }).then((canvas) => {
        // Restore original styles
        element.style.width = originalWidth;

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4', true);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        let ratio = canvasWidth / canvasHeight;

        let imgWidth = pdfWidth;
        let imgHeight = imgWidth / ratio;

        let heightLeft = imgHeight;
        let position = 0;
        
        if (imgHeight > pdfHeight) {
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position = position - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;
          }
        } else {
           pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
        }

        pdf.save(filename);
      });
    }
  };

  const downloadImage = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    const element = ref.current;
    if (element) {
       const originalWidth = element.style.width;
      element.style.width = '1024px';
      
      html2canvas(element, { 
        scale: 3, 
        backgroundColor: '#ffffff',
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
       }).then((canvas) => {
        element.style.width = originalWidth;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      });
    }
  };

  const handleEmail = (isCoverLetter: boolean) => {
    if (!user || !user.email) {
      toast({
        variant: "destructive",
        title: "Could not send email.",
        description: "You must be logged in to use this feature."
      })
      return;
    }
    
    const subject = isCoverLetter 
        ? "Your Generated Cover Letter" 
        : `Application for [Job Title] from ${customizedResume.name}`;

    const body = isCoverLetter 
        ? coverLetter 
        : `Dear [Hiring Manager],

Please find my resume attached for your consideration.

Thank you,
${customizedResume.name}`;
    
    const mailtoLink = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };


  const DocumentActions = ({ contentRef, filename, isCoverLetter = false }: { contentRef: React.RefObject<HTMLDivElement>, filename: string, isCoverLetter?: boolean }) => (
    <div className="flex items-center gap-2 flex-wrap">
      {user && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEmail(isCoverLetter)}
        >
          <Mail className="mr-2 h-4 w-4" />
          Mail
        </Button>
      )}
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
         
          <div className="flex items-center gap-4 flex-wrap justify-start">
            <TemplateSwitcher
                activeTemplate={activeTemplate}
                onTemplateChange={setActiveTemplate}
              />
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="resume">
                <FileText className="mr-2 h-4 w-4" />
                Resume
              </TabsTrigger>
              <TabsTrigger value="cover-letter">
                <Mail className="mr-2 h-4 w-4" />
                Letter
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent value="resume">
          <Card className="shadow-none bg-white/5">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b">
              <div className="flex-1">
                <CardTitle>Customized Resume</CardTitle>
                <CardDescription>
                  Optimized for the job description.
                </CardDescription>
              </div>
              <DocumentActions filename="customized-resume" contentRef={resumeRef} />
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-2 sm:p-8 bg-transparent max-h-[80vh] overflow-y-auto">
                <div ref={resumeRef} className={cn("p-6 sm:p-12 bg-white text-gray-800 shadow-2xl rounded-lg max-w-4xl mx-auto font-sans leading-relaxed resume-container", `template-${activeTemplate}`)}>
                  {/* Header */}
                  <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 resume-header gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 tracking-tight resume-name">{customizedResume.name}</h1>
                      {customizedResume.professionalTitle && <p className="text-lg md:text-2xl text-primary font-semibold mt-2 resume-title">{customizedResume.professionalTitle}</p>}
                    </div>
                    {customizedResume.photoDataUri && (
                       <Image src={customizedResume.photoDataUri} alt="Profile Photo" width={120} height={120} className="rounded-full object-cover w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/50 shadow-md resume-photo" />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200 resume-contact-info gap-4">
                    {customizedResume.contact && <p className="flex items-center gap-3 text-xs sm:text-sm break-all"><MailIcon size={16} className="text-primary shrink-0"/> {customizedResume.contact}</p>}
                    {customizedResume.location && <p className="flex items-center gap-3 text-xs sm:text-sm"><MapPin size={16} className="text-primary shrink-0"/> {customizedResume.location}</p>}
                    {customizedResume.website && <p className="flex items-center gap-3 text-xs sm:text-sm break-all"><Globe size={16} className="text-primary shrink-0"/> <a href={customizedResume.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{customizedResume.website}</a></p>}
                  </div>
                  
                  {/* Summary */}
                  <div className="mb-8 resume-section">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4 flex items-center gap-3 resume-section-title"><User/> Professional Summary</h2>
                    <p className="text-sm sm:text-base resume-section-content">{customizedResume.summary}</p>
                  </div>

                  {/* Work Experience */}
                  <div className="mb-8 resume-section">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4 flex items-center gap-3 resume-section-title"><Briefcase/> Work Experience</h2>
                    {customizedResume.experience.map((exp, index) => (
                      <div key={index} className="mb-6 resume-item">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                           <h3 className="text-lg sm:text-xl font-bold text-gray-800 resume-item-title">{exp.title}</h3>
                           <p className="text-sm sm:text-base text-gray-600 font-medium resume-item-dates">{exp.dates}</p>
                        </div>
                        <p className="text-base sm:text-lg font-semibold text-primary resume-item-subtitle">{exp.company}</p>
                        <p className="mt-2 text-sm sm:text-base whitespace-pre-line resume-item-description">{exp.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Education */}
                  <div className="mb-8 resume-section">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4 flex items-center gap-3 resume-section-title"><GraduationCap/> Education</h2>
                    {customizedResume.education.map((edu, index) => (
                      <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 resume-item">
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 resume-item-title">{edu.degree}</h3>
                            <p className="text-base sm:text-lg font-semibold text-primary resume-item-subtitle">{edu.school}</p>
                             {edu.percentage && <p className="text-sm sm:text-base text-gray-600 mt-1 resume-item-gpa">Percentage/GPA: {edu.percentage}</p>}
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 font-medium resume-item-dates mt-1 sm:mt-0">{edu.year}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="resume-section">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4 flex items-center gap-3 resume-section-title"><Star/> Skills</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-3 resume-skills">
                      {customizedResume.skills.map((skill, index) => (
                        <span key={index} className="bg-primary/10 text-primary-foreground font-semibold px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-base resume-skill-item">{skill}</span>
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
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b">
              <div>
                <CardTitle>Cover Letter</CardTitle>
                <CardDescription>
                  A compelling letter to introduce yourself.
                </CardDescription>
              </div>
               <DocumentActions filename="cover-letter" contentRef={coverLetterRef} isCoverLetter={true} />
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-2 sm:p-8 bg-transparent max-h-[80vh] overflow-y-auto">
                <div ref={coverLetterRef} className="p-6 sm:p-12 bg-white text-gray-800 shadow-2xl rounded-lg max-w-4xl mx-auto font-sans leading-relaxed">
                  <pre className="text-sm sm:text-base whitespace-pre-wrap font-sans">
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
