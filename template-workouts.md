# Workout Template/Library System Design

## 🎯 Current State Analysis

Looking at the existing structure:

• Workouts: Individual workout instances with specific dates (what we just built)
• Exercises: Library of individual exercises
• Missing: Workout templates/library for reusable workout plans

## 💡 Suggested Approach: Workout Templates

I recommend creating a Workout Template system with these features:

### 1. Database Schema Addition

model WorkoutTemplate {
id String @id @default(cuid())
name String // "Upper Body Push", "Kettlebell Circuit A"
description String?
exercises WorkoutTemplateExercise[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model WorkoutTemplateExercise {
id String @id @default(cuid())
templateId String
exerciseId String
sets Int
reps String // "12" or "12,10,8"
weight Float? // Optional default weight
restTime Int?
notes String?
group String?
order Int

template WorkoutTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
exercise Exercise @relation(fields: [exerciseId], references: [id])
}

### 2. New Navigation Item

Add "Templates" to the navigation between "Workouts" and "Exercises"

### 3. Templates Page Features

• Template Library: Display all saved workout templates
• Create Template: Similar to workout creation but no date/duration
• Use Template: Convert template to actual workout (pre-fills workout form)
• Template Actions: Edit, duplicate, delete templates

### 4. Integration Points

#### From Workouts Page:

• "Save as Template" button on existing workouts
• "Start from Template" option when creating new workouts

#### From Templates Page:

• "Use This Template" → navigates to workout creation with pre-filled exercises
• Template management (CRUD operations)

### 5. User Flow Examples

#### Creating Templates:

1. Templates page → "Add Template" → Fill name/exercises → Save
2. Workouts page → Select workout → "Save as Template" → Name it → Save

#### Using Templates:

1. Workouts page → "Add Workout" → "Start from Template" → Select template → Modify if needed → Save
2. Templates page → Select template → "Use Template" → Set date/duration → Save workout

## 🏗️ Implementation Strategy

### Phase 1: Core Template System

1. Add database schema migration
2. Create template tRPC router
3. Build Templates page with CRUD operations
4. Add "Templates" to navigation

### Phase 2: Integration Features

1. Add "Save as Template" to existing workouts
2. Add "Start from Template" to workout creation
3. Template selection modal/flow

### Phase 3: Enhanced Features

1. Template categories/tags
2. Template sharing/export
3. Default weight suggestions based on history
4. Template usage analytics

## 🎨 UI/UX Considerations

• Template Cards: Similar to workout cards but show exercise count, not date
• Template Preview: Show exercise list without weights (since they're defaults)
• Quick Actions: "Use Template", "Edit", "Duplicate", "Delete"
• Search/Filter: By name, exercise type, muscle groups

## 🔄 Benefits of This Approach

• Flexibility: Create templates from scratch OR save successful workouts as templates
• Separation of Concerns: Planning (templates) vs Execution (workouts)
• Easy Conversion: Templates ↔ Workouts with simple flows
• Progressive Enhancement: Start simple, add features incrementally
• Consistency: Follows existing UI/UX patterns from exercises and workouts