# Template Import Workflow

Bell Track does not call an LLM itself. Use ChatGPT or Codex to turn a workout description or image into the JSON format below, review the result, and then import it through **Templates → Import template**.

## Workflow

1. Give the assistant the workout description or image.
2. Ask it to return Bell Track template JSON.
3. Review exercise names, sets, reps, units, weights, substitutions, and notes.
4. Open **Templates → Import template**.
5. Paste the JSON and click **Import template**.

Exercise names must already exist in the exercise library. If an exercise is not available, add it first or ask the assistant to choose an existing replacement.

## JSON format

```json
{
  "name": "Bellplex Express — Under 30",
  "description": "5-minute mobility warmup, followed by four rounds.",
  "tags": ["Conditioning"],
  "exercises": [
    {
      "name": "Kickstand Deadlift",
      "sets": 4,
      "reps": "5",
      "weight": 44,
      "group": "A",
      "sectionTitle": "Main circuit",
      "notes": "5 per side."
    },
    {
      "name": "Push ups",
      "sets": 4,
      "reps": "MAX",
      "weight": 0,
      "group": "A"
    },
    {
      "name": "Suitcase carry",
      "sets": 4,
      "reps": "40",
      "unit": "TIME",
      "weight": 20,
      "group": "B"
    }
  ]
}
```

Use `unit: "TIME"` when `reps` represents seconds. Group values are letters such as `A` or `B`; the app adds the exercise number when displaying labels such as `A1` and `A2`.

## Prompt to reuse

> Convert this workout into Bell Track template JSON. Use only exercise names from my existing library. Include a clear template name, description, tags, sets, reps, weights, groups, section titles, and notes. Preserve per-side instructions in notes. If an exercise is shoulder-unfriendly, suggest an existing shoulder-friendly replacement and explain it in the notes. Return JSON only.
