
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button";
import { Brush } from "lucide-react";

interface BackgroundSwitcherProps {
  setBackgroundClass: (className: string) => void;
}

export function BackgroundSwitcher({ setBackgroundClass }: BackgroundSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Brush className="mr-2" /> Change Background
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setBackgroundClass('bg-image-1')}>
          Abstract
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setBackgroundClass('bg-image-2')}>
          Mountain
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setBackgroundClass('bg-image-3')}>
          Tech
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => setBackgroundClass('bg-image-none')}>
          None
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
