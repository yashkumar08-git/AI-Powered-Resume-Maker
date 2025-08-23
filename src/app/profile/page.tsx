
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader, FileText, ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSavedResumesAction } from "@/app/actions";
import { TailorResumeOutput } from "@/ai/flows/tailor-resume";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

type SavedResume = TailorResumeOutput & { id: string, createdAt: { seconds: number, nanoseconds: number }, resumeName?: string, professionalTitle?: string };

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchResumes = async () => {
        setLoadingResumes(true);
        const result = await getSavedResumesAction(user.uid);
        if (result.success && result.data) {
          // Sort resumes by creation date, newest first
          const sortedResumes = result.data.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
          });
          setResumes(sortedResumes as SavedResume[]);
        }
        setLoadingResumes(false);
      };
      fetchResumes();
    }
  }, [user]);

  const handleViewResume = (resume: SavedResume) => {
    localStorage.setItem('resumeResult', JSON.stringify(resume));
    router.push('/results');
  }

  const handleEditResume = (resume: SavedResume) => {
    localStorage.setItem('resumeToEdit', JSON.stringify(resume));
    router.push('/');
  }

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'AD';
    const name = user?.displayName;
    if (name) {
      const names = name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-full py-12">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
        <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
      <Card className="w-full">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.displayName || user.email}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 mt-4">
            <h3 className="text-lg font-semibold px-2">Saved Resumes</h3>
             {loadingResumes ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : resumes.length > 0 ? (
              <div className="border rounded-lg p-2 space-y-2">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between p-3 hover:bg-accent rounded-md transition-colors">
                    <div className="flex items-center gap-4">
                       <FileText className="text-primary h-6 w-6" />
                       <div>
                          <p className="font-semibold">{resume.resumeName || resume.professionalTitle || 'Resume'}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {resume.createdAt ? formatDistanceToNow(new Date(resume.createdAt.seconds * 1000), { addSuffix: true }) : 'recently'}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditResume(resume)}>
                        <Pencil className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewResume(resume)}>View</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="border rounded-lg p-4 text-center">
                    <p className="text-muted-foreground">No saved resumes yet.</p>
                    <Button variant="link" onClick={() => router.push('/')}>Create a new resume</Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
