# Exercises Page Concepts

## Layout & Structure
- Replace the nested list with a card grid (single column on mobile, two columns on desktop) that highlights exercise name, quick tags, and actions.
- Keep a sticky filter bar at the top that contains search, optional category/equipment filters, and sort toggles.
- Surface "Recently logged" and "Favorites" sections before the full list so common actions stay near the top.
- Ensure the Add Exercise call-to-action remains prominent—either in the header card or within the filter bar.

## Interaction Details
- Provide inline detail drawers or slide-overs to show sub-exercise breakdowns or coaching cues without leaving the page.
- Persist favorite status on the exercise model so the UI reflects user preferences across sessions.
- Consider quick actions on each card (view variations, duplicate, delete) to streamline management.

## Next Steps
1. Sketch the refreshed layout to confirm hierarchy across breakpoints.
2. Factor shared UI pieces (filter bar, exercise card) into dedicated components under `src/components/exercises/`.
3. Hook filters into `api.exercise.getAll` (or a dedicated filtered query) and verify behavior on mobile Safari.
