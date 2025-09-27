"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { EXERCISE_TYPES } from "@/types";
import { ExerciseModal } from "./index";

type SimpleExerciseFormData = {
  name: string;
  description: string;
};

interface AddSimpleExerciseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseCreated?: (exerciseId: string) => void;
}

export function AddExerciseModal({
  isOpen,
  onOpenChange,
  onExerciseCreated,
}: AddSimpleExerciseModalProps) {
  const utils = api.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SimpleExerciseFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createExercise = api.exercise.create.useMutation({
    onSuccess: (data) => {
      utils.exercise.getAll.invalidate();
      onExerciseCreated?.(data.id);
      reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: SimpleExerciseFormData) => {
    createExercise.mutate({
      name: data.name,
      type: EXERCISE_TYPES.EXERCISE,
      description: data.description,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ExerciseModal.NameField register={register as any} error={errors.name} />
          <ExerciseModal.DescriptionField register={register as any} />
          <ExerciseModal.Actions
            onCancel={() => onOpenChange(false)}
            isPending={createExercise.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
