"use client";

import { useForm } from "react-hook-form";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="max-h-[80vh]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>Add New Exercise</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4 overflow-y-auto flex-1">
            <ExerciseModal.NameField
              register={register}
              errorMessage={errors.name?.message}
            />
            <ExerciseModal.DescriptionField register={register} />
          </div>
          <DrawerFooter>
            <ExerciseModal.Actions
              onCancel={() => onOpenChange(false)}
              isPending={createExercise.isPending}
            />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
