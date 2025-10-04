# Templates Tag Worklog

## Completed
- [x] Extend Prisma schema with `WorkoutTag` and `WorkoutTemplateTag` relations and regenerate migrations.
- [x] Seed a starter catalog of workout tags (EMOM, AMRAP, etc.) in `prisma/seed.ts`.
- [x] Update template tRPC router to fetch, filter, and persist tags plus expose `getTags`.

## To Do
- [x] Wire `api.template.getAll` to accept `search` and `tagSlugs` filters on the Templates page.
- [x] Fetch available tags via `api.template.getTags` and render a tag filter UI.
- [x] Display assigned tags on each template card and add empty-state messaging for filtered results.
- [ ] Align Templates page layout/styling with the Exercises page, including search input and counts.
