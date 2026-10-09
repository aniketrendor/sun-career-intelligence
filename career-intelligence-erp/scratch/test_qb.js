const fs = require('fs');
const path = require('path');

const qb = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/data/qb-v2/master-qb-891.json'), 'utf8'));
const progs = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/data/sandip-programs.json'), 'utf8'));

console.log('Total questions in master QB:', qb.questions.length);
console.log('Total catalog programs:', progs.length);

const progMap = new Map();
progs.forEach(p => progMap.set(p.program_id, p));

// Categorize all questions into UG, PG, or Universal (L1 / general)
let ugQuestions = [];
let pgQuestions = [];
let universalQuestions = [];

qb.questions.forEach(q => {
  if (q.level === 'L1') {
    universalQuestions.push(q);
    return;
  }
  
  if (q.id.includes('-UG-') || q.id.startsWith('COM-UG-') || q.id.startsWith('DES-UG-') || q.id.startsWith('ENG-UG-') || q.id.startsWith('LAW-UG-') || q.id.startsWith('SCI-UG-') || q.id.startsWith('PHA-UG-') || q.id.startsWith('CSE-L2-') || q.id.startsWith('CSE-L3-')) {
    ugQuestions.push(q);
    return;
  }

  if (q.id.includes('-PG-') || q.id.startsWith('COM-PG-') || q.id.startsWith('DES-PG-') || q.id.startsWith('ENG-PG-') || q.id.startsWith('LAW-PG-') || q.id.startsWith('SCI-PG-') || q.id.startsWith('PHA-PG-') || q.id.startsWith('PHD-')) {
    pgQuestions.push(q);
    return;
  }

  if (q.id.startsWith('SUN-')) {
    const pid = q.id.split('-').slice(0, 2).join('-');
    const prog = progMap.get(pid);
    if (prog) {
      if (prog.level === 'UG') {
        ugQuestions.push(q);
      } else if (prog.level === 'PG') {
        pgQuestions.push(q);
      } else {
        universalQuestions.push(q);
      }
      return;
    }
  }

  universalQuestions.push(q);
});

console.log('UG questions count:', ugQuestions.length);
console.log('PG questions count:', pgQuestions.length);
console.log('Universal/L1 questions count:', universalQuestions.length);

// Print all L1 questions
console.log('\n--- All 20 L1 Questions ---');
qb.questions.filter(q => q.level === 'L1').forEach((q, i) => {
  console.log(`[L1-${i+1}] ID: ${q.id} | Type: ${q.questionType.padEnd(14)} | ${q.questionText}`);
});

// Print all Ranking questions
console.log('\n--- All Ranking Questions in Bank ---');
qb.questions.filter(q => q.questionType === 'Ranking').forEach(q => {
  console.log(`ID: ${q.id} | Level: ${q.level} | ${q.questionText}`);
  q.options.forEach(opt => {
    console.log(`   [${opt.key}] ${opt.displayText}`);
  });
});
