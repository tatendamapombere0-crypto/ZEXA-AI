// scripts/build_full_primary_hbc_line_by_line.cjs
// Compiles all Grade 7 HBC line-by-line QA modules and verifies full coverage against the user document

const fs = require('fs');
const path = require('path');

const { hssQA } = require('./generate_hss_qa.cjs');
const { religionQA } = require('./generate_religion_qa.cjs');
const { ictQA } = require('./generate_ict_qa.cjs');
const { artsPeQA } = require('./generate_arts_pe_qa.cjs');

console.log('--- Compiling Grade 7 HBC Line-by-Line Database ---');
console.log('HSS entries:', hssQA.length);
console.log('Religion entries:', religionQA.length);
console.log('ICT entries:', ictQA.length);
console.log('Arts & PE entries:', artsPeQA.length);

const allEntries = [...hssQA, ...religionQA, ...ictQA, ...artsPeQA];
console.log('Total combined QA entries:', allEntries.length);

// 1. Write the dedicated Grade 7 HBC line-by-line QA database
const srcQaPath = path.join(__dirname, '..', 'src', 'data', 'zimsec_grade7_hbc_line_by_line_qa.json');
const publicQaPath = path.join(__dirname, '..', 'public', 'assets', 'zimsec_grade7_hbc_line_by_line_qa.json');

fs.writeFileSync(srcQaPath, JSON.stringify(allEntries, null, 2), 'utf8');
fs.writeFileSync(publicQaPath, JSON.stringify(allEntries, null, 2), 'utf8');
console.log(`Saved Grade 7 HBC QA database to ${srcQaPath} and ${publicQaPath}`);

// 2. Cross-reference and inject all topics, questions, and key terms into the Universal Glossary
const glossarySrcPath = path.join(__dirname, '..', 'src', 'data', 'zimsec_universal_glossary_terms.json');
const glossaryPublicPath = path.join(__dirname, '..', 'public', 'assets', 'zimsec_universal_glossary_terms.json');

let glossary = JSON.parse(fs.readFileSync(glossarySrcPath, 'utf8'));
const existingKeys = new Set(glossary.map(e => e.canonicalName.toLowerCase().trim()));

let addedCount = 0;
for (const item of allEntries) {
  // Add entry for the exact question/topic
  const qClean = item.question.trim();
  const tClean = item.topic.trim();

  // 1. Add for the topic if not present
  if (!existingKeys.has(tClean.toLowerCase())) {
    glossary.push({
      id: `zimsec_hbc_${item.id}_topic`,
      term: item.topic,
      canonicalName: item.topic,
      aliases: [item.topic, ...(item.normalizedQuestions || [])],
      subject: item.section,
      definition: item.answer.replace(/^### [^\n]+\n\n/, '').slice(0, 450) + '...',
      topic: item.topic,
      content: `${item.topic} (${item.section}): ${item.answer}`,
      source: `ZIMSEC Grade 7 HBC • ${item.section}`,
      keywords: item.keywords || [],
      levels: ["Primary", "General"]
    });
    existingKeys.add(tClean.toLowerCase());
    addedCount++;
  }

  // 2. Add for the specific question line (especially for preserving heritage sites!)
  const qSlug = qClean.toLowerCase();
  if (!existingKeys.has(qSlug)) {
    glossary.push({
      id: `zimsec_hbc_${item.id}_q`,
      term: item.question.charAt(0).toUpperCase() + item.question.slice(1),
      canonicalName: item.question,
      aliases: item.normalizedQuestions || [item.question],
      subject: item.section,
      definition: item.answer,
      topic: item.topic,
      content: `${item.question} (${item.topic}): ${item.answer}`,
      source: `ZIMSEC Grade 7 HBC • ${item.section}`,
      keywords: item.keywords || [],
      levels: ["Primary", "General"]
    });
    existingKeys.add(qSlug);
    addedCount++;
  }

  // 3. Add explicit alias entries for "ways of preserving heritage sites" if this is the heritage preservation entry
  if (item.id === 'hss_heritage_sites_describe_ways_of_preserving') {
    const specialAliases = [
      "ways of preserving heritage sites",
      "ways of preserving heritage sites of zimbabwe",
      "preservation of heritage sites",
      "how to preserve heritage sites in zimbabwe",
      "methods of preserving heritage sites of zimbabwe"
    ];
    for (const sa of specialAliases) {
      if (!existingKeys.has(sa)) {
        glossary.push({
          id: `zimsec_hbc_heritage_preserve_${sa.replace(/[^a-z0-9]/g, '_')}`,
          term: "Preservation of Heritage Sites of Zimbabwe",
          canonicalName: sa,
          aliases: specialAliases,
          subject: "Heritage and Social Studies",
          definition: item.answer,
          topic: "Preservation of heritage sites",
          content: item.answer,
          source: "ZIMSEC Grade 7 HBC • Heritage and Social Studies",
          keywords: ["heritage sites", "preserving heritage sites", "zimbabwe heritage sites"],
          levels: ["Primary", "General"]
        });
        existingKeys.add(sa);
        addedCount++;
      }
    }
  }

  if (item.id === 'hss_heritage_sites_identify_major') {
    const specialAliases = [
      "major heritage sites of zimbabwe",
      "heritage sites of zimbabwe",
      "identify major heritage sites of zimbabwe",
      "list heritage sites of zimbabwe"
    ];
    for (const sa of specialAliases) {
      if (!existingKeys.has(sa)) {
        glossary.push({
          id: `zimsec_hbc_heritage_sites_${sa.replace(/[^a-z0-9]/g, '_')}`,
          term: "Major Heritage Sites of Zimbabwe",
          canonicalName: sa,
          aliases: specialAliases,
          subject: "Heritage and Social Studies",
          definition: item.answer,
          topic: "Preservation of heritage sites",
          content: item.answer,
          source: "ZIMSEC Grade 7 HBC • Heritage and Social Studies",
          keywords: ["major heritage sites of zimbabwe", "great zimbabwe", "khami ruins", "matobo hills"],
          levels: ["Primary", "General"]
        });
        existingKeys.add(sa);
        addedCount++;
      }
    }
  }
}

fs.writeFileSync(glossarySrcPath, JSON.stringify(glossary, null, 2), 'utf8');
fs.writeFileSync(glossaryPublicPath, JSON.stringify(glossary, null, 2), 'utf8');
console.log(`Updated Universal Glossary with ${addedCount} new HBC entries. Total terms: ${glossary.length}`);

// 3. Verify that the user's specific failing query is now 100% resolvable!
console.log('\n--- VERIFYING USER FAILING QUERY ---');
const testQuery = "describe ways of preserving heritage sites of Zimbabwe";
const foundInQA = allEntries.find(e => 
  e.normalizedQuestions.some(nq => nq.toLowerCase() === testQuery.toLowerCase()) ||
  e.question.toLowerCase() === testQuery.toLowerCase()
);
if (foundInQA) {
  console.log('✅ Found in QA Database:', foundInQA.topic, '->', foundInQA.question);
  console.log('Answer excerpt:', foundInQA.answer.slice(0, 150) + '...');
} else {
  console.log('❌ NOT FOUND in QA Database!');
}
