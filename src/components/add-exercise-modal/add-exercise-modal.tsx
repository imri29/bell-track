"use client";

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
  const isMobile = useIsMobile();
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

  const formFields = (
    <>
      <div className="px-4 pb-4 space-y-4 overflow-y-auto flex-1">
        <ExerciseModal.NameField register={register} errorMessage={errors.name?.message} />
        <ExerciseModal.DescriptionField register={register} />
      </div>
      <DrawerFooter>
        <ExerciseModal.Actions
          onCancel={() => onOpenChange(false)}
          isPending={createExercise.isPending}
        />
      </DrawerFooter>
    </>
  );

  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={preventEnterFromSelect}
            className="flex flex-col gap-4"
          >
            <ExerciseModal.NameField register={register} errorMessage={errors.name?.message} />
            <ExerciseModal.DescriptionField register={register} />
            <DialogFooter className="pt-2">
              <ExerciseModal.Actions
                onCancel={() => onOpenChange(false)}
                isPending={createExercise.isPending}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="max-h-[80vh]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={preventEnterFromSelect}
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>Add New Exercise</DrawerTitle>
          </DrawerHeader>
          {formFields}
        </form>
      </DrawerContent>
    </Drawer>
  );
}
