"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/LoadingState";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Wand2, Briefcase, FileText } from "lucide-react";

const formSchema = z.object({
  resume: z.string().min(100, "Resume must be at least 100 characters."),
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [result, setResult] = useState<TailorResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resume: "",
      jobDescription: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);

    const response = await handleTailorResumeAction(values);

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
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          Craft Your Career Path
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Upload your resume, paste a job description, and let our AI craft a
          perfectly tailored application for you.
        </p>
      </div>

      <Card className="mt-8 md:mt-12 max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 />
            Let's Get Started
          </CardTitle>
          <CardDescription>
            Provide your resume and the job description to begin the tailoring
            process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="text-primary" />
                      Your Resume
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your full resume text here..."
                        className="min-h-[250px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-lg font-semibold">
                      <Briefcase className="text-primary" />
                      Job Description
                    </FormLabel>
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
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
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
