# ECN GeoJSON Data

This folder contains GeoJSON map data from the Election Commission of Nepal (ECN).

## Structure

```
geo/
├── ecn-provinces.json     # All 7 provinces (already downloaded)
├── districts/             # District GeoJSON files (one per province)
│   ├── state-1.json       # Province 1 (Koshi) districts
│   ├── state-2.json       # Province 2 (Madhesh) districts
│   ├── state-3.json       # Province 3 (Bagmati) districts
│   ├── state-4.json       # Province 4 (Gandaki) districts
│   ├── state-5.json       # Province 5 (Lumbini) districts
│   ├── state-6.json       # Province 6 (Karnali) districts
│   └── state-7.json       # Province 7 (Sudurpashchim) districts
└── constituencies/        # Constituency GeoJSON files (one per district)
    ├── dist-1.json        # Taplejung constituencies
    ├── dist-2.json        # Panchthar constituencies
    └── ... (77 files total)
```

## How to Download Data

Since ECN blocks direct API access (CORS), download manually:

### Step 1: Download Districts

1. Open https://election.gov.np in your browser
2. Open Developer Tools (F12) → Console tab
3. Copy contents of `scripts/browser-fetch-districts.js` and paste in console
4. Press Enter - 7 files will download
5. Move files to `frontend/public/geo/districts/`

### Step 2: Download Constituencies (Optional)

1. Still on election.gov.np with Console open
2. Copy contents of `scripts/browser-fetch-constituencies.js` and paste
3. Press Enter (takes ~2-3 minutes)
4. Move downloaded files to `frontend/public/geo/constituencies/`

## ECN URL Pattern

- Provinces: `JSONFiles/JSONMap/geojson/Province.json`
- Districts: `JSONFiles/JSONMap/geojson/District/STATE_C_{stateId}.json`
- Constituencies: `JSONFiles/JSONMap/geojson/Const/dist-{districtId}.json`