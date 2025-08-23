
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Paintbrush } from "lucide-react";

export type Template = "modern" | "classic" | "creative";

interface TemplateSwitcherProps {
  activeTemplate: Template;
  onTemplateChange: (template: Template) => void;
}

export function TemplateSwitcher({ activeTemplate, onTemplateChange }: TemplateSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Paintbrush className="mr-2" />
          Template
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Resume Template</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={activeTemplate}
          onValueChange={(value) => onTemplateChange(value as Template)}
        >
          <DropdownMenuRadioItem value="modern">Modern</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="classic">Classic</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="creative">Creative</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
