# CAT parts data

Use **real CAT part numbers** in Parts identification by providing a parts list here.

## Quick start

1. **Copy the sample** (optional):  
   `cp cat-parts-sample.json cat-parts.json`

2. **Replace with your data**:  
   Edit `cat-parts.json` with part numbers from:
   - **CAT SIS 2.0** (Service Information System) – export or copy part numbers and descriptions.
   - Your dealer or internal parts catalog (CSV/Excel → convert to JSON).
   - Any source that provides official Caterpillar part numbers.

## Format: `cat-parts.json`

JSON array of objects:

```json
[
  { "partNumber": "230-5743", "description": "Hydraulic cylinder assembly", "equipmentModel": "320" },
  { "partNumber": "123-4567", "description": "Track roller", "equipmentModel": "320" }
]
```

- **partNumber** (required): Official CAT part number (e.g. `230-5743`).
- **description** (optional): Short part description.
- **equipmentModel** (optional): Model code (e.g. `320`, `336`) so results can be filtered when the user enters an equipment model.

If `cat-parts.json` is missing, the app uses `cat-parts-sample.json` (sample data only).

## Size

The app sends up to 300 parts to the model per request. For large catalogs:

- Filter by equipment model in your export, or
- Set `CAT_PARTS_FILE` (see below) to a model-specific file (e.g. `data/parts-320.json`).

## Custom path

Set in `.env.local`:

```bash
CAT_PARTS_FILE=data/cat-parts.json
```

Or another path relative to the project root.
