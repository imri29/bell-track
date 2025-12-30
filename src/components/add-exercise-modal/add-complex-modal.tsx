"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { preventEnterFromSelect } from "@/lib/form-handlers";
import { api } from "@/trpc/react";
import { EXERCISE_TYPES } from "@/types";
import { AddExerciseModal } from "./add-exercise-modal";
import type { ComplexExerciseFormValues } from "./components/complex-exercise-builder";
import { ExerciseModal } from "./index";

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
  const isMobile = useIsMobile();
  const utils = api.useUtils();
  const { data: exercises } = api.exercise.getAll.useQuery();
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);

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

  const formFields = (
    <>
      <ExerciseModal.NameField register={register} errorMessage={errors.name?.message} />
      <ExerciseModal.ComplexBuilder
        control={control}
        register={register}
        exercises={exercises}
        onCreateNewExercise={() => setIsAddExerciseModalOpen(true)}
      />
      <ExerciseModal.DescriptionField register={register} />
    </>
  );

  return (
    <>
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        onOpenChange={(open) => setIsAddExerciseModalOpen(open)}
        onExerciseCreated={onExerciseCreated}
      />
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onOpenChange} repositionInputs={false}>
          <DrawerContent className="max-h-[80vh]" fullHeight>
            <form
              onSubmit={handleSubmit(onSubmit)}
              onKeyDown={preventEnterFromSelect}
              className="flex h-full min-h-0 flex-col"
            >
              <DrawerHeader>
                <DrawerTitle>Add New Complex</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 min-h-0">{formFields}</div>
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
      ) : (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Complex</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              onKeyDown={preventEnterFromSelect}
              className="flex flex-col gap-4 max-h-[70vh] overflow-hidden"
            >
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">{formFields}</div>
              <DialogFooter>
                <ExerciseModal.Actions
                  onCancel={() => onOpenChange(false)}
                  isPending={createExercise.isPending}
                  submitText="Add Complex"
                  loadingText="Adding Complex..."
                />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
