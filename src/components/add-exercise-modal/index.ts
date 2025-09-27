import { AddComplexExerciseModal } from "./add-complex-modal";
import { AddExerciseModal } from "./add-exercise-modal";
import { ComplexExerciseBuilder } from "./components/complex-exercise-builder";
import { ExerciseDescriptionField } from "./components/exercise-description-field";
import { ExerciseFormActions } from "./components/exercise-form-actions";
import { ExerciseNameField } from "./components/exercise-name-field";

export const ExerciseModal = {
  Simple: AddExerciseModal,
  Complex: AddComplexExerciseModal,
  NameField: ExerciseNameField,
  DescriptionField: ExerciseDescriptionField,
  ComplexBuilder: ComplexExerciseBuilder,
  Actions: ExerciseFormActions,
};

// Keep individual exports for flexibility
export { AddComplexExerciseModal } from "./add-complex-modal";
export { AddExerciseModal } from "./add-exercise-modal";
export { ComplexExerciseBuilder } from "./components/complex-exercise-builder";
export { ExerciseDescriptionField } from "./components/exercise-description-field";
export { ExerciseFormActions } from "./components/exercise-form-actions";
export { ExerciseNameField } from "./components/exercise-name-field";
