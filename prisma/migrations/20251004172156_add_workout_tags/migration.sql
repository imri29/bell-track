-- CreateTable
CREATE TABLE "WorkoutTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutTemplateTag" (
    "templateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutTemplateTag_pkey" PRIMARY KEY ("templateId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutTag_name_key" ON "WorkoutTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutTag_slug_key" ON "WorkoutTag"("slug");

-- AddForeignKey
ALTER TABLE "WorkoutTemplateTag" ADD CONSTRAINT "WorkoutTemplateTag_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTemplateTag" ADD CONSTRAINT "WorkoutTemplateTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "WorkoutTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
