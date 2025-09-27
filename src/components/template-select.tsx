"use client";

import { BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

type TemplateSelectProps = {
  onTemplateSelect: (templateId: string) => void;
  variant?: "dropdown" | "button";
  className?: string;
};

export function TemplateSelect({
  onTemplateSelect,
  variant = "dropdown",
  className = "",
}: TemplateSelectProps) {
  const { data: templates } = api.template.getAll.useQuery();

  const handleTemplateSelect = (templateId: string) => {
    onTemplateSelect(templateId);
  };

  if (variant === "button") {
    return (
      <Select onValueChange={handleTemplateSelect}>
        <SelectTrigger
          className={`w-auto gap-1.5 px-3 py-2 h-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer ${className}`}
        >
          <BookOpen className="h-4 w-4" />
          <SelectValue placeholder="From Template" />
        </SelectTrigger>
        <SelectContent>
          {templates?.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select onValueChange={handleTemplateSelect}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="From Template" />
      </SelectTrigger>
      <SelectContent>
        {templates?.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
