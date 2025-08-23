
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { handleCustomizeResumeAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { CustomizeResumeOutput } from "@/ai/flows/tailor-resume";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/LoadingState";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Wand2, Briefcase, FileText, PlusCircle, Trash2, GraduationCap, Star, Building, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  dates: z.string(),
  description: z.string(),
});

const educationSchema = z.object({
  degree: z.string(),
  school: z.string(),
  year: z.string(),
  percentage: z.string().optional(),
});

const formSchema = z.object({
  name: z.string(),
  professionalTitle: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  experiences: z.array(experienceSchema),
  educations: z.array(educationSchema),
  skills: z.string(),
  jobDescription: z.string(),
  photo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function assembleResume(values: FormValues): string {
  let resume = `Name: ${values.name}\n`;
  if(values.professionalTitle) resume += `Professional Title: ${values.professionalTitle}\n`;
  resume += `Email: ${values.email}\n`;
  if(values.phone) resume += `Phone: ${values.phone}\n`;
  if(values.linkedin) resume += `LinkedIn: ${values.linkedin}\n`;

  if(values.location) resume += `Location: ${values.location}\n`;
  if(values.website) resume += `Website: ${values.website}\n\n`;

  resume += "Work Experience:\n";
  values.experiences.forEach(exp => {
    resume += `- ${exp.title} at ${exp.company} (${exp.dates})\n  ${exp.description.replace(/\n/g, '\n  ')}\n`;
  });
  resume += "\nEducation:\n";
  values.educations.forEach(edu => {
    resume += `- ${edu.degree}, ${edu.school} (${edu.year})`;
    if (edu.percentage) {
      resume += ` - ${edu.percentage}`;
    }
    resume += '\n';
  });
  resume += `\nSkills:\n${values.skills}`;
  return resume;
}


export default function Home() {
  const [result, setResult] = useState<CustomizeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      professionalTitle: "",
      email: "",
      phone: "",
      linkedin: "",
      location: "",
      website: "",
      experiences: [{ title: "", company: "", dates: "", description: "" }],
      educations: [{ degree: "", school: "", year: "", percentage: "" }],
      skills: "",
      jobDescription: "",
      photo: "",
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: "educations",
  });


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('photo', dataUri);
        setPhotoPreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);

    const resume = assembleResume(values);
    const response = await handleCustomizeResumeAction({
      resume: resume, 
      jobDescription: values.jobDescription,
      photoDataUri: values.photo,
    });

    setIsLoading(false);
    if (response.success && response.data) {
      setResult(response.data);
      toast({
        title: "Success!",
        description: "Your customized documents have been generated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          response.error || "There was a problem with your request.",
      });
    }
  };

  const handleCreateNew = () => {
    setResult(null);
    form.reset();
    setPhotoPreview(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center max-w-3xl mx-auto animate-fade-in-up mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground backdrop-blur-sm bg-black/10 rounded-md px-4 py-2 inline-block">
          AI-Powered Resume Maker
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Fill in your details, paste a job description, and let our AI craft a
          perfectly customized resume and cover letter for you.
        </p>
      </div>

      {!result && !isLoading && (
         <Card className="mt-8 md:mt-12 max-w-4xl mx-auto animate-fade-in-up shadow-2xl shadow-primary/10 bg-gradient-to-br from-card to-background/50 transition-all duration-300 hover:shadow-primary/20 hover:scale-[1.02]" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Wand2 className="text-primary"/>
              Let's Get Started
            </CardTitle>
            <CardDescription>
              Provide your details and the job description to begin the customization
              process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                 <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']} className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold"><FileText className="text-primary mr-3" /> Personal Information</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4 bg-accent/30 rounded-md">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="professionalTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Professional Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Senior Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                       </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(123) 456-7890" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">LinkedIn URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold">Location</FormLabel>
                                  <FormControl>
                                    <Input placeholder="San Francisco, CA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold">Website/Portfolio</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://your-portfolio.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        <FormItem>
                          <FormLabel className="font-semibold">Profile Photo</FormLabel>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <FormControl>
                                  <Input type="file" accept="image/*" className="max-w-xs" onChange={handlePhotoChange} />
                              </FormControl>
                              {photoPreview && (
                                  <Image src={photoPreview} alt="Profile preview" width={80} height={80} className="rounded-full object-cover w-20 h-20" />
                              )}
                              {!photoPreview && (
                                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shrink-0">
                                      <ImageIcon className="text-muted-foreground" />
                                  </div>
                              )}
                          </div>
                          <FormDescription>
                            Optional: Upload a professional headshot.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xl font-semibold"><Building className="text-primary mr-3" /> Work Experience</AccordionTrigger>
                    <AccordionContent className="space-y-6 p-2">
                      {expFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md relative space-y-3 bg-accent/30">
                           <FormField
                            control={form.control}
                            name={`experiences.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Job Title</FormLabel>
                                <FormControl><Input placeholder="Software Engineer" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`experiences.${index}.company`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Company</FormLabel>
                                <FormControl><Input placeholder="Tech Inc." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`experiences.${index}.dates`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Dates</FormLabel>
                                <FormControl><Input placeholder="Jan 2022 - Present" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`experiences.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Description</FormLabel>
                                <FormControl><Textarea placeholder="Describe your responsibilities and achievements..." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {expFields.length > 1 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExp(index)}><Trash2 className="text-destructive" /></Button>}
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendExp({ title: "", company: "", dates: "", description: "" })}><PlusCircle className="mr-2" /> Add Experience</Button>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-3">
                    <AccordionTrigger className="text-xl font-semibold"><GraduationCap className="text-primary mr-3" /> Education</AccordionTrigger>
                    <AccordionContent className="space-y-6 p-2">
                      {eduFields.map((field, index) => (
                         <div key={field.id} className="p-4 border rounded-md relative space-y-3 bg-accent/30">
                           <FormField
                            control={form.control}
                            name={`educations.${index}.degree`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">Degree / Certificate</FormLabel>
                                <FormControl><Input placeholder="B.S. in Computer Science" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`educations.${index}.school`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold">School / University</FormLabel>
                                <FormControl><Input placeholder="State University" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`educations.${index}.year`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold">Year of Graduation</FormLabel>
                                  <FormControl><Input placeholder="2021" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`educations.${index}.percentage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-semibold">Percentage/GPA</FormLabel>
                                  <FormControl><Input placeholder="e.g. 85% or 3.8/4.0" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                           </div>
                          {eduFields.length > 1 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEdu(index)}><Trash2 className="text-destructive" /></Button>}
                         </div>
                      ))}
                       <Button type="button" variant="outline" onClick={() => appendEdu({ degree: "", school: "", year: "", percentage: "" })}><PlusCircle className="mr-2" /> Add Education</Button>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-4">
                    <AccordionTrigger className="text-xl font-semibold"><Star className="text-primary mr-3" /> Skills</AccordionTrigger>
                    <AccordionContent className="p-4 bg-accent/30 rounded-md">
                       <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Skills</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List your skills, separated by commas (e.g., JavaScript, React, Node.js)..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-5">
                    <AccordionTrigger className="text-xl font-semibold"><Briefcase className="text-primary mr-3" /> Job Description</AccordionTrigger>
                    <AccordionContent className="p-4 bg-accent/30 rounded-md">
                       <FormField
                        control={form.control}
                        name="jobDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Job Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste the job description here..."
                                className="min-h-[200px] resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Craft My Resume'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}


      {isLoading && <LoadingState />}
      {result && <ResultsDisplay result={result} onStartOver={handleCreateNew} />}
    </div>
  );
}
