-- Ensure workout tag tables exist (covers prod environments where previous migration was empty)

CREATE TABLE IF NOT EXISTS "WorkoutTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkoutTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WorkoutTemplateTag" (
    "templateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkoutTemplateTag_pkey" PRIMARY KEY ("templateId", "tagId")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkoutTag_name_key" ON "WorkoutTag"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "WorkoutTag_slug_key" ON "WorkoutTag"("slug");

DO $$
BEGIN
    ALTER TABLE "WorkoutTemplateTag"
      ADD CONSTRAINT "WorkoutTemplateTag_templateId_fkey"
      FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
    ALTER TABLE "WorkoutTemplateTag"
      ADD CONSTRAINT "WorkoutTemplateTag_tagId_fkey"
      FOREIGN KEY ("tagId") REFERENCES "WorkoutTag"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;
