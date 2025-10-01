"use client";

import { format } from "date-fns";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CalendarView } from "@/components/calendar-view";
import { EditWorkoutModal } from "@/components/edit-workout-modal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutListView } from "@/components/workout-list-view";
import { useConfirm } from "@/contexts/confirm-context";
import type { RouterOutputs } from "@/server/api/root";
import { api } from "@/trpc/react";

type WorkoutWithExercises = RouterOutputs["workout"]["getAll"][number];

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className={"flex justify-center items-center h-full w-full"}>
          Loading...
        </div>
      }
    >
      <HistoryPageComponent />
    </Suspense>
  );
}

function HistoryPageComponent() {
  const utils = api.useUtils();
  const { confirm } = useConfirm();
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view");

  const {
    data: workouts,
    isPending: workoutsPending,
    error: workoutsError,
  } = api.workout.getAll.useQuery();

  const { mutate: deleteWorkout, isPending: isDeleting } =
    api.workout.delete.useMutation({
      onSuccess: () => {
        utils.workout.getAll.invalidate();
      },
    });

  const [editingWorkout, setEditingWorkout] =
    useState<WorkoutWithExercises | null>(null);

  const { data: templates } = api.template.getAll.useQuery();

  const handleEdit = (workout: WorkoutWithExercises) => {
    setEditingWorkout(workout);
  };

  const handleCloseEditModal = () => {
    setEditingWorkout(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) {
      return;
    }

    const params = new URLSearchParams({ templateId });
    router.push(`/history/new?${params.toString()}`);
  };

  const handleDelete = async (workout: { id: string; date: string }) => {
    const confirmed = await confirm({
      title: "Delete Workout",
      description: `Are you sure you want to delete the workout from ${format(new Date(workout.date), "dd/MM/yyyy")}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      deleteWorkout({ id: workout.id });
    }
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <main className="max-w-4xl mx-auto">
        <EditWorkoutModal
          isOpen={editingWorkout !== null}
          onOpenChange={(open) => {
            if (!open) handleCloseEditModal();
          }}
          workout={editingWorkout}
        />

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Workout history</h1>
            <p className="text-xl text-muted-foreground">
              View and manage your workout history
            </p>
          </div>
        </div>

        <Tabs defaultValue="list" value={view ?? "list"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger asChild value="list" className="w-full gap-2">
              <Link className="w-full" href="/history?view=list">
                List view
              </Link>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Link className="w-full" href="/history?view=calendar">
                Calendar view
              </Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <div className="p-6 bg-muted rounded-lg">
              <div className="flex md:flex-row flex-col justify-between mb-3">
                <h2 className="text-2xl font-semibold mb-4">Your Workouts</h2>
                <div className="flex gap-2">
                  <Button asChild className="gap-1.5">
                    <Link href="/history/new">
                      <Plus />
                      Add Workout
                    </Link>
                  </Button>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="w-auto gap-1.5 px-3 py-2 h-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer">
                      <BookOpen className="h-4 w-4" />
                      <SelectValue placeholder="Add from Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <WorkoutListView
                workouts={workouts}
                workoutsPending={workoutsPending}
                workoutsError={workoutsError}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView
              workouts={workouts || []}
              onEditWorkout={handleEdit}
              onDeleteWorkout={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
