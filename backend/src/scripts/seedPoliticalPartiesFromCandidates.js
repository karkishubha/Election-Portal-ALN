/**
 * Seed Political Parties From Candidates
 * Nepal Election Portal
 *
 * Fetches the public candidates JSON and inserts unique political parties
 * into the `political_parties` table if they don't already exist.
 */

require('dotenv').config();
const { connectDB } = require('../config/database');
const { PoliticalParty } = require('../models');

// Source URL (server-side fetch, no CORS issues)
const CANDIDATES_URL = 'https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt';

async function fetchCandidates() {
  const res = await fetch(CANDIDATES_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch candidates: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function seedParties() {
  await connectDB();
  console.log('Seeding political parties from candidates...');

  const candidates = await fetchCandidates();
  if (!Array.isArray(candidates) || candidates.length === 0) {
    console.log('No candidates data found. Aborting.');
    return;
  }

  // Collect unique party names (Nepali names as provided in dataset)
  const uniqueParties = new Map();
  for (const c of candidates) {
    const nameNep = (c.PoliticalPartyName || '').trim();
    if (!nameNep) continue;
    if (!uniqueParties.has(nameNep)) {
      uniqueParties.set(nameNep, {
        partyNameNepali: nameNep,
        partyName: nameNep, // Fallback until English name is available
        abbreviation: null,
        partySymbolUrl: null,
        officialWebsite: null,
        manifestoPdfUrl: null,
        description: 'Political party of Nepal',
        displayOrder: 0,
        published: true,
      });
    }
  }

  const partiesToInsert = Array.from(uniqueParties.values());
  console.log(`Found ${partiesToInsert.length} unique parties.`);

  let created = 0;
  let skipped = 0;

  for (const p of partiesToInsert) {
    // Check if party already exists by nepali or english name
    const existing = await PoliticalParty.findOne({
      where: {
        partyNameNepali: p.partyNameNepali,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await PoliticalParty.create(p);
    created++;
  }

  console.log(`Done. Created: ${created}, Skipped: ${skipped}`);
}

seedParties()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  });
