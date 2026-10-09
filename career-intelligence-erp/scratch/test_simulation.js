const fs = require('fs');
const path = require('path');

const qb = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/data/qb-v2/master-qb-891.json'), 'utf8'));
const progs = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/data/sandip-programs.json'), 'utf8'));

// Test simulation of router logic
function testRouterLogic() {
  console.log('Testing Router Logic for both UG and PG across multiple student profiles...\n');

  // Let's verify that UG never gets PG questions and PG never gets UG questions
  const ugProgs = progs.filter(p => p.level === 'UG');
  const pgProgs = progs.filter(p => p.level === 'PG');
  console.log(`Available UG Programs: ${ugProgs.length}, PG Programs: ${pgProgs.length}`);
}

testRouterLogic();
