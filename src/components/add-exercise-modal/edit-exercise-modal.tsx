"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { preventEnterFromSelect } from "@/lib/form-handlers";
import type { RouterOutputs } from "@/server/api/root";
import { api } from "@/trpc/react";
import { EXERCISE_TYPES } from "@/types";
import { AddExerciseModal } from "./add-exercise-modal";
import type { ComplexExerciseFormValues } from "./components/complex-exercise-builder";
import { ExerciseModal } from "./index";

type Exercise = RouterOutputs["exercise"]["getAll"][number];

interface EditExerciseModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type SimpleExerciseFormData = {
  name: string;
  description: string;
};

export function EditExerciseModal({
  exercise,
  isOpen,
  onOpenChange,
}: EditExerciseModalProps) {
  if (!exercise) {
    return null;
  }

  if (exercise.type === EXERCISE_TYPES.COMPLEX) {
    return (
      <EditComplexExerciseModalContent
        key={exercise.id}
        exercise={exercise}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    );
  }

  return (
    <EditSimpleExerciseModalContent
      key={exercise.id}
      exercise={exercise}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    />
  );
}

function EditSimpleExerciseModalContent({
  exercise,
  isOpen,
  onOpenChange,
}: {
  exercise: Exercise;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = api.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SimpleExerciseFormData>({
    defaultValues: {
      name: exercise.name,
      description: exercise.description ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: exercise.name,
      description: exercise.description ?? "",
    });
  }, [exercise, reset]);

  const updateExercise = api.exercise.update.useMutation({
    onSuccess: () => {
      utils.exercise.getAll.invalidate();
      onOpenChange(false);
    },
  });

  const onSubmit = handleSubmit((data) => {
    updateExercise.mutate({
      id: exercise.id,
      name: data.name,
      type: EXERCISE_TYPES.EXERCISE,
      description: data.description.trim() ? data.description : undefined,
    });
  });

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="max-h-[80vh]">
        <form
          onSubmit={onSubmit}
          onKeyDown={preventEnterFromSelect}
          className="flex h-full flex-col"
        >
          <DrawerHeader>
            <DrawerTitle>Edit Exercise</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <ExerciseModal.NameField
              register={register}
              errorMessage={errors.name?.message}
            />
            <ExerciseModal.DescriptionField register={register} />
          </div>
          <DrawerFooter>
            <ExerciseModal.Actions
              onCancel={() => onOpenChange(false)}
              isPending={updateExercise.isPending}
              submitText="Save Changes"
              loadingText="Saving..."
            />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

function EditComplexExerciseModalContent({
  exercise,
  isOpen,
  onOpenChange,
}: {
  exercise: Exercise;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = api.useUtils();
  const { data: exercises } = api.exercise.getAll.useQuery();
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ComplexExerciseFormValues>({
    defaultValues: {
      name: exercise.name,
      description: exercise.description ?? "",
      subExercises: (exercise.subExercises ?? []).map((movement) => ({
        exerciseId: "",
        exerciseName: movement.exerciseName,
        reps: movement.reps,
      })),
    },
  });

  useEffect(() => {
    const matchedSubExercises = (exercise.subExercises ?? []).map(
      (movement) => {
        const matchingExercise = exercises?.find(
          (ex) =>
            ex.type === EXERCISE_TYPES.EXERCISE &&
            ex.name.toLowerCase() === movement.exerciseName.toLowerCase(),
        );

        return {
          exerciseId: matchingExercise?.id ?? "",
          exerciseName: movement.exerciseName,
          reps: movement.reps,
        };
      },
    );

    reset({
      name: exercise.name,
      description: exercise.description ?? "",
      subExercises: matchedSubExercises,
    });
  }, [exercise, exercises, reset]);

  const updateExercise = api.exercise.update.useMutation({
    onSuccess: () => {
      utils.exercise.getAll.invalidate();
      onOpenChange(false);
    },
  });

  const onSubmit = handleSubmit((data) => {
    const subExercises = data.subExercises.map((movement) => ({
      exerciseName: movement.exerciseName,
      reps: movement.reps,
    }));

    updateExercise.mutate({
      id: exercise.id,
      name: data.name,
      description: data.description.trim() ? data.description : undefined,
      type: EXERCISE_TYPES.COMPLEX,
      subExercises,
    });
  });

  return (
    <>
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        onOpenChange={(open) => setIsAddExerciseModalOpen(open)}
      />
      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        repositionInputs={false}
      >
        <DrawerContent className="max-h-[80vh]" fullHeight>
          <form
            onSubmit={onSubmit}
            onKeyDown={preventEnterFromSelect}
            className="flex h-full min-h-0 flex-col"
          >
            <DrawerHeader>
              <DrawerTitle>Edit Complex</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-4 pb-4">
              <ExerciseModal.NameField
                register={register}
                errorMessage={errors.name?.message}
              />
              <ExerciseModal.ComplexBuilder
                control={control}
                register={register}
                exercises={exercises}
                onCreateNewExercise={() => setIsAddExerciseModalOpen(true)}
              />
              <ExerciseModal.DescriptionField register={register} />
            </div>
            <DrawerFooter>
              <ExerciseModal.Actions
                onCancel={() => onOpenChange(false)}
                isPending={updateExercise.isPending}
                submitText="Save Changes"
                loadingText="Saving..."
              />
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}
