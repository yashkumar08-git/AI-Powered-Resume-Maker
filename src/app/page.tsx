"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { handleTailorResumeAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { TailorResumeOutput } from "@/ai/flows/tailor-resume";

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
import { Wand2, Briefcase, FileText, PlusCircle, Trash2, GraduationCap, Star, Building } from "lucide-react";

const experienceSchema = z.object({
  title: z.string().min(1, "Title is required."),
  company: z.string().min(1, "Company is required."),
  dates: z.string().min(1, "Dates are required."),
  description: z.string().min(1, "Description is required."),
});

const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required."),
  school: z.string().min(1, "School is required."),
  year: z.string().min(1, "Year is required."),
});

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  contact: z.string().min(5, "Contact info is required."),
  experiences: z.array(experienceSchema).min(1, "At least one work experience is required."),
  educations: z.array(educationSchema).min(1, "At least one education entry is required."),
  skills: z.string().min(3, "Skills are required."),
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters."),
});

type FormValues = z.infer<typeof formSchema>;

function assembleResume(values: FormValues): string {
  let resume = `Name: ${values.name}\nContact: ${values.contact}\n\n`;
  resume += "Work Experience:\n";
  values.experiences.forEach(exp => {
    resume += `- ${exp.title} at ${exp.company} (${exp.dates})\n  ${exp.description.replace(/\n/g, '\n  ')}\n`;
  });
  resume += "\nEducation:\n";
  values.educations.forEach(edu => {
    resume += `- ${edu.degree}, ${edu.school} (${edu.year})\n`;
  });
  resume += `\nSkills:\n${values.skills}`;
  return resume;
}


export default function Home() {
  const [result, setResult] = useState<TailorResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact: "",
      experiences: [{ title: "", company: "", dates: "", description: "" }],
      educations: [{ degree: "", school: "", year: "" }],
      skills: "",
      jobDescription: "",
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


  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);

    const resume = assembleResume(values);
    const response = await handleTailorResumeAction({resume: resume, jobDescription: values.jobDescription});

    setIsLoading(false);
    if (response.success && response.data) {
      setResult(response.data);
      toast({
        title: "Success!",
        description: "Your tailored documents have been generated.",
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground">
          AI-Powered Resume Maker
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground" style={{ animationDelay: '0.2s' }}>
          Fill in your details, paste a job description, and let our AI craft a
          perfectly tailored resume and cover letter for you.
        </p>
      </div>

      <Card className="mt-8 md:mt-12 max-w-4xl mx-auto shadow-2xl shadow-primary/10 border-primary/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Wand2 className="text-primary"/>
            Let's Get Started
          </CardTitle>
          <CardDescription>
            Provide your details and the job description to begin the tailoring
            process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
               <Accordion type="multiple" defaultValue={['item-1', 'item-5']} className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-xl font-semibold"><FileText className="text-primary mr-3" /> Personal Information</AccordionTrigger>
                  <AccordionContent className="space-y-4 p-4 bg-secondary/30 rounded-md">
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
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Contact Information</FormLabel>
                            <FormControl>
                              <Input placeholder="Email, Phone, LinkedIn URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-xl font-semibold"><Building className="text-primary mr-3" /> Work Experience</AccordionTrigger>
                  <AccordionContent className="space-y-6 p-2">
                    {expFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md relative space-y-3 bg-secondary/30">
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
                       <div key={field.id} className="p-4 border rounded-md relative space-y-3 bg-secondary/30">
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
                        {eduFields.length > 1 && <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEdu(index)}><Trash2 className="text-destructive" /></Button>}
                       </div>
                    ))}
                     <Button type="button" variant="outline" onClick={() => appendEdu({ degree: "", school: "", year: "" })}><PlusCircle className="mr-2" /> Add Education</Button>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                  <AccordionTrigger className="text-xl font-semibold"><Star className="text-primary mr-3" /> Skills</AccordionTrigger>
                  <AccordionContent className="p-4 bg-secondary/30 rounded-md">
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
                  <AccordionContent className="p-4 bg-secondary/30 rounded-md">
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
                {isLoading ? 'Generating...' : 'Craft My Application'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && <LoadingState />}
      {result && <ResultsDisplay result={result} />}
    </div>
  );
}
