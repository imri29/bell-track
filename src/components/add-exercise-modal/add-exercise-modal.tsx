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
import { ExerciseModal } from "./index";
import type { ExerciseClassificationValues } from "./components/exercise-classification-fields";

type SimpleExerciseFormData = {
  name: string;
  description: string;
};

interface AddSimpleExerciseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseCreated?: (exercise: { id: string; name: string; type: string }) => void;
}

export function AddExerciseModal({
  isOpen,
  onOpenChange,
  onExerciseCreated,
}: AddSimpleExerciseModalProps) {
  const isMobile = useIsMobile();
  const utils = api.useUtils();
  const [classification, setClassification] = useState<ExerciseClassificationValues>({
    movementGroup: null,
    movementPlane: null,
    legBias: null,
  });

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
      onExerciseCreated?.({ id: data.id, name: data.name, type: data.type });
      reset();
      setClassification({ movementGroup: null, movementPlane: null, legBias: null });
      onOpenChange(false);
    },
  });

  const onSubmit = (data: SimpleExerciseFormData) => {
    createExercise.mutate({
      name: data.name,
      type: EXERCISE_TYPES.EXERCISE,
      description: data.description,
      ...classification,
    });
  };

  const formFields = (
    <>
      <div className="px-4 pb-4 space-y-4 overflow-y-auto flex-1">
        <ExerciseModal.NameField register={register} errorMessage={errors.name?.message} />
        <ExerciseModal.DescriptionField register={register} />
        <ExerciseModal.ClassificationFields
          value={classification}
          onChange={(key, value) => setClassification((current) => ({ ...current, [key]: value }))}
        />
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
            <ExerciseModal.ClassificationFields
              value={classification}
              onChange={(key, value) =>
                setClassification((current) => ({ ...current, [key]: value }))
              }
            />
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
