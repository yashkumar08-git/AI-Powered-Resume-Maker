
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
import { Loader, FileText, ArrowLeft, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSavedResumesAction, getResumeWithPhotoAction } from "@/app/actions";
import { TailorResumeOutput } from "@/ai/flows/tailor-resume";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type SavedResume = Omit<TailorResumeOutput, 'customizedResume'> & { 
  id: string, 
  createdAt: { seconds: number, nanoseconds: number }, 
  resumeName?: string, 
  professionalTitle?: string,
  customizedResume: Omit<TailorResumeOutput['customizedResume'], 'photoDataUri'> & { photoDataUri?: string }
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [isFetchingDetails, setIsFetchingDetails] = useState<string | null>(null);

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
  
  const fetchResumeDetails = async (resumeId: string) => {
    setIsFetchingDetails(resumeId);
    const result = await getResumeWithPhotoAction(resumeId);
    setIsFetchingDetails(null);

    if (result.success && result.data) {
      return result.data;
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not load resume details.",
      });
      return null;
    }
  };

  const handleViewResume = async (resume: SavedResume) => {
    const fullResume = await fetchResumeDetails(resume.id);
    if (fullResume) {
      localStorage.setItem('resumeResult', JSON.stringify(fullResume));
      router.push('/results');
    }
  }

  const handleEditResume = async (resume: SavedResume) => {
    const fullResume = await fetchResumeDetails(resume.id);
    if (fullResume) {
      localStorage.setItem('resumeToEdit', JSON.stringify(fullResume));
      router.push('/');
    }
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
            className="mb-4 animate-fade-in-up"
        >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
      <Card className="w-full animate-fade-in-up shadow-lg">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary/50">
                <AvatarFallback className="text-3xl">{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.displayName || user.email}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 mt-4">
            <h3 className="text-lg font-semibold px-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Saved Resumes</h3>
             {loadingResumes ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : resumes.length > 0 ? (
              <div className="border rounded-lg p-2 space-y-2">
                {resumes.map((resume, index) => (
                  <div 
                    key={resume.id} 
                    className="flex items-center justify-between p-3 rounded-md transition-all duration-300 ease-in-out hover:bg-accent hover:shadow-md hover:scale-[1.02] animate-fade-in-up"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                    <div className="flex items-center gap-4" onClick={() => handleViewResume(resume)}>
                       <FileText className="text-primary h-6 w-6" />
                       <div className="cursor-pointer">
                          <p className="font-semibold">{resume.resumeName || resume.professionalTitle || 'Resume'}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {resume.createdAt ? formatDistanceToNow(new Date(resume.createdAt.seconds * 1000), { addSuffix: true }) : 'recently'}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditResume(resume)} disabled={isFetchingDetails === resume.id}>
                         {isFetchingDetails === resume.id ? <Loader className="animate-spin" /> : <Pencil className="mr-2 h-3 w-3" />}
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewResume(resume)} disabled={isFetchingDetails === resume.id}>
                         {isFetchingDetails === resume.id ? <Loader className="animate-spin" /> : <Eye className="mr-2 h-3 w-3" />}
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="border rounded-lg p-4 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <p className="text-muted-foreground">No saved resumes yet.</p>
                    <Button variant="link" onClick={() => router.push('/')}>Create a new resume</Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
