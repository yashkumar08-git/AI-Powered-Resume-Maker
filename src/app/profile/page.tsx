
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
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-full py-12">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-full py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.displayName || user.email}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 mt-4">
            <h3 className="text-lg font-semibold">Saved Resumes</h3>
            <div className="border rounded-lg p-4 text-center">
                <p className="text-muted-foreground">No saved resumes yet.</p>
                <Button variant="link" onClick={() => router.push('/')}>Create a new resume</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
