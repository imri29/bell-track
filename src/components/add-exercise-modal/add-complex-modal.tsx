"use client";

import { useForm } from "react-hook-form";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { api } from "@/trpc/react";
import { EXERCISE_TYPES } from "@/types";
import { ExerciseModal } from "./index";
import type { ComplexExerciseFormValues } from "./components/complex-exercise-builder";

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
  } = useForm<ComplexExerciseFormValues>({
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

  const onSubmit = (data: ComplexExerciseFormValues) => {
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
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>Add New Complex</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4 overflow-y-auto flex-1">
            <ExerciseModal.NameField
              register={register}
              errorMessage={errors.name?.message}
            />
            <ExerciseModal.ComplexBuilder
              control={control}
              register={register}
              exercises={exercises}
            />
            <ExerciseModal.DescriptionField register={register} />
          </div>
          <DrawerFooter>
            <ExerciseModal.Actions
              onCancel={() => onOpenChange(false)}
              isPending={createExercise.isPending}
              submitText="Add Complex"
              loadingText="Adding Complex..."
            />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
