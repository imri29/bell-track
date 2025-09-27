"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { EXERCISE_TYPES, type SubExercise } from "@/types";
import { ExerciseModal } from "./index";

type ComplexExerciseFormData = {
  name: string;
  description: string;
  subExercises: SubExercise[];
};

interface AddComplexExerciseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseCreated?: (exerciseId: string) => void;
}

export function AddComplexExerciseModal({
  isOpen,
  onOpenChange,
  onExerciseCreated,
}: AddComplexExerciseModalProps) {
  const utils = api.useUtils();
  const { data: exercises } = api.exercise.getAll.useQuery();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ComplexExerciseFormData>({
    defaultValues: {
      name: "",
      description: "",
      subExercises: [],
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

  const onSubmit = (data: ComplexExerciseFormData) => {
    const subExercises = data.subExercises.map((subEx) => ({
      exerciseName: subEx.exerciseName,
      reps: subEx.reps,
    }));

    createExercise.mutate({
      name: data.name,
      type: EXERCISE_TYPES.COMPLEX,
      description: data.description,
      subExercises,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Complex</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ExerciseModal.NameField register={register as any} error={errors.name} />
          <ExerciseModal.ComplexBuilder
            control={control}
            register={register}
            exercises={exercises}
          />
          <ExerciseModal.DescriptionField register={register as any} />
          <ExerciseModal.Actions
            onCancel={() => onOpenChange(false)}
            isPending={createExercise.isPending}
            submitText="Add Complex"
            loadingText="Adding Complex..."
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
