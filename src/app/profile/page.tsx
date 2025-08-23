
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  return (
    <div className="flex justify-center items-start min-h-full py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="user avatar"/>
                <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">Alex Doe</CardTitle>
            <CardDescription>alex.doe@example.com</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 mt-4">
            <h3 className="text-lg font-semibold">Saved Resumes</h3>
            <div className="border rounded-lg p-4 text-center">
                <p className="text-muted-foreground">No saved resumes yet.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
