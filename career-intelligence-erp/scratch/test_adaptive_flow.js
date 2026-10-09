const fs = require('fs');
const path = require('path');

const qb = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/data/qb-v2/master-qb-891.json'), 'utf8'));
const progs = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/data/sandip-programs.json'), 'utf8'));

const qMap = new Map();
qb.questions.forEach(q => qMap.set(q.id, q));
qb.differentiators.forEach(d => qMap.set(d.id, d));

const progMap = new Map();
progs.forEach(p => progMap.set(p.program_id, p));

function getQuestionDomainCode(q) {
  if (q.id.startsWith('COM-') || q.target.includes('SUN-036') || q.target.includes('SUN-052')) return 'BUS';
  if (q.id.startsWith('DES-') || q.target.includes('SUN-092') || q.target.includes('SUN-101')) return 'DESIGN';
  if (q.id.startsWith('LAW-') || q.target.includes('SUN-071') || q.target.includes('SUN-074')) return 'LAW';
  if (q.id.startsWith('SCI-') || q.target.includes('SUN-078') || q.target.includes('SUN-086')) return 'SCI';
  if (q.id.startsWith('PHA-') || q.target.includes('SUN-065') || q.target.includes('SUN-067')) return 'HEALTH';
  if (q.id.startsWith('ENG-') || q.target.includes('SUN-001') || q.target.includes('SUN-010')) return 'ENG';
  if (q.id.startsWith('CSE-') || q.target.includes('SUN-020') || q.target.includes('SUN-032')) return 'TECH';

  if (q.id.startsWith('SUN-')) {
    const pid = q.id.split('-').slice(0, 2).join('-');
    const prog = progMap.get(pid);
    if (prog) {
      if (prog.school.includes('Commerce') || prog.school.includes('Management')) return 'BUS';
      if (prog.school.includes('Design')) return 'DESIGN';
      if (prog.school.includes('Law')) return 'LAW';
      if (prog.school.includes('Science')) return 'SCI';
      if (prog.school.includes('Pharmaceutical')) return 'HEALTH';
      if (prog.school.includes('Engineering')) return 'ENG';
      if (prog.school.includes('Computer Science')) return 'TECH';
    }
  }

  for (const opt of q.options) {
    if (opt.targetDomainCodes && opt.targetDomainCodes.length > 0) {
      return opt.targetDomainCodes[0];
    }
  }

  return 'BUS';
}

function normalizeAcademicLevel(profile) {
  const lvl = (profile.academicLevel || profile.level || '').toString().toUpperCase().trim();
  if (lvl.includes('PG') || lvl.includes('MASTER') || lvl.includes('MBA') || lvl.includes('M.') || lvl.includes('POST')) {
    return 'PG';
  }
  return 'UG';
}

function getEligiblePrograms(profile) {
  const targetLevel = normalizeAcademicLevel(profile);
  return progs.filter(p => p.level === targetLevel);
}

function isQuestionCompatibleWithLevel(q, track) {
  if (q.level === 'L1') return true;

  if (q.level === 'L2' || q.level === 'L3') {
    if (track === 'UG') {
      if (
        q.id.includes('-PG-') ||
        q.id.startsWith('PHD-') ||
        q.target.includes('SUN-032 to SUN-035') ||
        q.target.includes('SUN-010 to SUN-019') ||
        q.target.includes('SUN-052 to SUN-064') ||
        q.target.includes('SUN-101 to SUN-105') ||
        q.target.includes('SUN-074 to SUN-077') ||
        q.target.includes('SUN-086 to SUN-091') ||
        q.target.includes('SUN-067 to SUN-070') ||
        q.target.includes('SUN-106 to SUN-114')
      ) {
        return false;
      }
      return true;
    } else {
      if (
        q.id.includes('-UG-') ||
        q.id.startsWith('CSE-L2-') ||
        q.id.startsWith('CSE-L3-') ||
        q.target.includes('SUN-001 to SUN-009') ||
        q.target.includes('SUN-036 to SUN-051') ||
        q.target.includes('SUN-092 to SUN-100') ||
        q.target.includes('SUN-071 to SUN-073') ||
        q.target.includes('SUN-078 to SUN-085') ||
        q.target.includes('SUN-065 to SUN-066')
      ) {
        return false;
      }
      return true;
    }
  }

  if (q.id.startsWith('SUN-')) {
    const pid = q.id.split('-').slice(0, 2).join('-');
    const prog = progMap.get(pid);
    if (prog) return prog.level === track;
  }

  if (q.targetProgramIds && q.targetProgramIds.length > 0) {
    return q.targetProgramIds.some(pid => {
      const prog = progMap.get(pid);
      return prog ? prog.level === track : true;
    });
  }

  return true;
}

function evaluateEvidence(responses, profile) {
  const targetLevel = normalizeAcademicLevel(profile);
  const domainScores = { TECH: 0, ENG: 0, BUS: 0, DESIGN: 0, SCI: 0, LAW: 0, HEALTH: 0, SOCIAL: 0 };
  const programEvidenceScores = {};
  progs.forEach(p => { programEvidenceScores[p.program_id] = 0; });

  responses.forEach(resp => {
    const q = qMap.get(resp.questionId);
    if (!q) return;

    const qDomain = getQuestionDomainCode(q);

    if (resp.rankings && Array.isArray(resp.rankings) && resp.rankings.length > 0) {
      const rankWeights = [1.0, 0.7, 0.45, 0.2, 0.1];
      resp.rankings.forEach((optId, rIdx) => {
        const weight = (rankWeights[rIdx] || 0.1) * (q.weight || 1.0);
        const opt = q.options.find(o => o.id === optId || o.key === optId);
        if (!opt) return;

        const dCodes = opt.targetDomainCodes.length > 0 ? opt.targetDomainCodes : [qDomain];
        dCodes.forEach(d => {
          domainScores[d] = (domainScores[d] || 0) + (14 * weight);
        });

        opt.targetProgramIds.forEach(pid => {
          if (programEvidenceScores[pid] !== undefined) {
            programEvidenceScores[pid] += 20 * weight;
          }
        });
      });
      return;
    }

    const selectedOptionIds = resp.selectedOptionIds || (resp.selectedOptionId ? [resp.selectedOptionId] : []);
    if (selectedOptionIds.length === 0) return;
    const multFactor = selectedOptionIds.length > 1 ? 1 / Math.sqrt(selectedOptionIds.length) : 1.0;

    selectedOptionIds.forEach(optId => {
      const opt = q.options.find(o => o.id === optId || o.key === optId);
      if (!opt) return;

      const dCodes = opt.targetDomainCodes.length > 0 ? opt.targetDomainCodes : [qDomain];
      dCodes.forEach(d => {
        domainScores[d] = (domainScores[d] || 0) + (10 * (q.weight || 1.0) * multFactor);
      });

      opt.targetProgramIds.forEach(pid => {
        if (programEvidenceScores[pid] !== undefined) {
          programEvidenceScores[pid] += 15 * (q.weight || 1.0) * multFactor;
        }
      });
    });
  });

  const eligiblePids = new Set(getEligiblePrograms(profile).map(p => p.program_id));
  const topDomains = Object.entries(domainScores).sort((a, b) => b[1] - a[1]).map(([d]) => d);
  const topPrograms = Object.entries(programEvidenceScores)
    .filter(([pid]) => eligiblePids.has(pid))
    .sort((a, b) => b[1] - a[1])
    .map(([pid]) => pid);

  if (topPrograms.length === 0) {
    const defaultList = progs.filter(p => p.level === targetLevel).map(p => p.program_id);
    return { domainScores, programEvidenceScores, topDomains, topPrograms: defaultList };
  }

  return { domainScores, programEvidenceScores, topDomains, topPrograms };
}

const L1_BALANCED_SEQUENCE = ['L1-01', 'L1-02', 'L1-03', 'L1-04', 'L1-05', 'L1-10'];

function selectNextQuestion(responses, profile) {
  const track = normalizeAcademicLevel(profile);
  const askedIds = new Set(responses.map(r => r.questionId));
  const answeredCount = responses.length;

  if (answeredCount >= 30) {
    const evalRes = evaluateEvidence(responses, profile);
    return { nextQuestion: null, isComplete: true, topCandidates: evalRes.topPrograms.slice(0, 5) };
  }

  const countsByLevel = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, DIFF: 0 };
  responses.forEach(r => {
    const q = qMap.get(r.questionId);
    if (q) {
      const lvl = q.level || 'DIFF';
      countsByLevel[lvl] = (countsByLevel[lvl] || 0) + 1;
    }
  });

  const { topDomains, topPrograms } = evaluateEvidence(responses, profile);

  let targetLevel = 'L1';
  if (countsByLevel.L1 < 6) targetLevel = 'L1';
  else if (countsByLevel.L2 < 6) targetLevel = 'L2';
  else if (countsByLevel.L3 < 6) targetLevel = 'L3';
  else if (countsByLevel.L4 < 6) targetLevel = 'L4';
  else targetLevel = 'L5';

  if (targetLevel === 'L1') {
    for (const qId of L1_BALANCED_SEQUENCE) {
      if (!askedIds.has(qId)) {
        const q = qMap.get(qId);
        if (q) return { nextQuestion: q, currentLevel: 'L1', topCandidates: topPrograms.slice(0, 5) };
      }
    }
    const pool = qb.questions.filter(q => q.level === 'L1' && !askedIds.has(q.id));
    if (pool.length > 0) return { nextQuestion: pool[0], currentLevel: 'L1', topCandidates: topPrograms.slice(0, 5) };
  }

  // L2: Strictly adapt to top domains from past responses
  if (targetLevel === 'L2') {
    const levelPool = qb.questions
      .filter(q => q.level === 'L2')
      .filter(q => isQuestionCompatibleWithLevel(q, track))
      .filter(q => !askedIds.has(q.id));

    // Try candidate's top domain first, then top 2, then top 3
    for (const d of topDomains) {
      const match = levelPool.find(q => getQuestionDomainCode(q) === d);
      if (match) return { nextQuestion: match, currentLevel: 'L2', topCandidates: topPrograms.slice(0, 5) };
    }
    if (levelPool.length > 0) return { nextQuestion: levelPool[0], currentLevel: 'L2', topCandidates: topPrograms.slice(0, 5) };
  }

  // L3: Strictly adapt to top degree paths for top domains
  if (targetLevel === 'L3') {
    const levelPool = qb.questions
      .filter(q => q.level === 'L3')
      .filter(q => isQuestionCompatibleWithLevel(q, track))
      .filter(q => !askedIds.has(q.id));

    for (const d of topDomains) {
      const match = levelPool.find(q => getQuestionDomainCode(q) === d);
      if (match) return { nextQuestion: match, currentLevel: 'L3', topCandidates: topPrograms.slice(0, 5) };
    }
    if (levelPool.length > 0) return { nextQuestion: levelPool[0], currentLevel: 'L3', topCandidates: topPrograms.slice(0, 5) };
  }

  // L4: Strictly adapt to candidate's top programs from past responses
  if (targetLevel === 'L4') {
    const levelPool = qb.questions
      .filter(q => q.level === 'L4')
      .filter(q => isQuestionCompatibleWithLevel(q, track))
      .filter(q => !askedIds.has(q.id));

    for (const candidatePid of topPrograms.slice(0, 5)) {
      const candidateQuestions = levelPool.filter(
        q =>
          q.id.startsWith(`${candidatePid}-`) ||
          q.targetProgramIds.includes(candidatePid) ||
          q.options.some(opt => opt.targetProgramIds.includes(candidatePid))
      );
      if (candidateQuestions.length > 0) {
        return { nextQuestion: candidateQuestions[0], currentLevel: 'L4', topCandidates: topPrograms.slice(0, 5) };
      }
    }
    if (levelPool.length > 0) return { nextQuestion: levelPool[0], currentLevel: 'L4', topCandidates: topPrograms.slice(0, 5) };
  }

  // L5: Deep specialization and differentiators for top candidate programs
  if (targetLevel === 'L5') {
    const levelPool = qb.questions
      .filter(q => q.level === 'L5')
      .filter(q => isQuestionCompatibleWithLevel(q, track))
      .filter(q => !askedIds.has(q.id));

    for (const candidatePid of topPrograms.slice(0, 5)) {
      const candidateQuestions = levelPool.filter(
        q =>
          q.id.startsWith(`${candidatePid}-`) ||
          q.targetProgramIds.includes(candidatePid) ||
          q.options.some(opt => opt.targetProgramIds.includes(candidatePid))
      );
      if (candidateQuestions.length > 0) {
        return { nextQuestion: candidateQuestions[0], currentLevel: 'L5', topCandidates: topPrograms.slice(0, 5) };
      }
    }
    if (levelPool.length > 0) return { nextQuestion: levelPool[0], currentLevel: 'L5', topCandidates: topPrograms.slice(0, 5) };
  }

  return { nextQuestion: null, isComplete: true, topCandidates: topPrograms.slice(0, 5) };
}

// ─── RUN SIMULATION FOR DESIGN STUDENT ─────────────────────────────
console.log('\n======================================================');
console.log('SIMULATION: UG DESIGN & VISUAL ARTS STUDENT');
console.log('======================================================');

const ugDesignResponses = [];
for (let i = 0; i < 30; i++) {
  const step = selectNextQuestion(ugDesignResponses, { academicLevel: 'UG', stream: 'Arts' });
  if (!step.nextQuestion) break;
  const q = step.nextQuestion;

  let pickedAns;
  if (q.questionType === 'Ranking') {
    const desOpt = q.options.find(o => o.targetDomainCodes.includes('DESIGN')) || q.options[0];
    const otherOpts = q.options.filter(o => o.id !== desOpt.id);
    pickedAns = { questionId: q.id, rankings: [desOpt.id, ...otherOpts.map(o => o.id)] };
  } else {
    const desOpt = q.options.find(o => o.targetDomainCodes.includes('DESIGN') || (o.targetProgramIds && o.targetProgramIds.some(pid => pid >= 'SUN-092' && pid <= 'SUN-100'))) || q.options[0];
    pickedAns = { questionId: q.id, selectedOptionIds: [desOpt.id] };
  }
  ugDesignResponses.push(pickedAns);

  console.log(`Q${i+1} [${q.level}] ID: ${q.id.padEnd(16)} | Domain: ${getQuestionDomainCode(q).padEnd(6)} | ${q.questionText.slice(0, 50)}...`);
}

const finalDes = evaluateEvidence(ugDesignResponses, { academicLevel: 'UG', stream: 'Arts' });
console.log('\nFinal UG Design Result:');
console.log('Top Domains:', finalDes.topDomains.slice(0, 3));
console.log('Top Program Candidates:', finalDes.topPrograms.slice(0, 3).map(pid => pid + ': ' + (progMap.get(pid)?.name || pid)));
