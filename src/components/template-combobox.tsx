"use client";

import { Combobox } from "@/components/ui/combobox";
import { api } from "@/trpc/react";

interface TemplateComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function TemplateCombobox({
  value = "",
  onValueChange,
  placeholder = "Search templates",
  id,
  className,
  disabled = false,
}: TemplateComboboxProps) {
  const { data: templates } = api.template.getAll.useQuery();
  const availableTemplates = templates ?? [];

  const selectedTemplate =
    value === "" ? null : (availableTemplates.find((template) => template.id === value) ?? null);

  return (
    <Combobox
      items={availableTemplates}
      value={selectedTemplate}
      onValueChange={(nextValue) => {
        onValueChange(nextValue?.id ?? "");
      }}
      getItemKey={(template) => template.id}
      getItemLabel={(template) => template.name}
      placeholder={placeholder}
      id={id}
      className={className}
      disabled={disabled}
    />
  );
}
