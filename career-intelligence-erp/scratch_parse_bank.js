const fs = require('fs')
const path = require('path')

const mdPath = path.resolve('..', 'stage_1_UG_PG_question_bank.md')
const content = fs.readFileSync(mdPath, 'utf8')

function parseQuestionBank(rawText) {
  const sections = rawText.split(/^# /m)
  console.log('Sections found:', sections.length)
  
  const ugSection = rawText.substring(rawText.indexOf('# Stage 1 UG Adaptive Question Bank'), rawText.indexOf('# PG Bank'))
  const pgSection = rawText.substring(rawText.indexOf('# Stage 1 PG Adaptive Question Bank'))
  
  function parseBank(sectionText, track) {
    const qBlocks = sectionText.split(/###\s+(UG\d+|PG\d+)/g)
    const questions = []
    
    for (let i = 1; i < qBlocks.length; i += 2) {
      const qId = qBlocks[i].trim()
      const body = qBlocks[i + 1]
      
      const lines = body.split('\n').map(l => l.trim()).filter(Boolean)
      const questionText = lines[0]
      
      let type = ''
      let difficulty = ''
      let dimensions = []
      let answer = ''
      const options = []
      
      for (const line of lines) {
        if (line.startsWith('**Type:**')) {
          type = line.replace('**Type:**', '').trim()
        } else if (line.startsWith('**Difficulty:**')) {
          difficulty = line.replace('**Difficulty:**', '').trim()
        } else if (line.startsWith('**Dimensions:**')) {
          dimensions = line.replace('**Dimensions:**', '').split(',').map(d => d.trim()).filter(Boolean)
        } else if (line.startsWith('**Answer:**')) {
          answer = line.replace('**Answer:**', '').trim()
        } else if (/^[A-D]\.\s+/.test(line)) {
          const optLetter = line[0]
          const optText = line.substring(2).trim()
          options.push({ id: optLetter, text: optText })
        }
      }
      
      // Determine level (1..5)
      let level = 1
      const numMatch = qId.match(/\d+/)
      const qNum = numMatch ? parseInt(numMatch[0], 10) : 1
      if (qNum <= 15) level = 1
      else if (qNum <= 35) level = 2
      else if (qNum <= 60) level = 3
      else if (qNum <= 85) level = 4
      else level = 5
      
      questions.push({
        id: qId,
        number: qNum,
        track,
        level,
        type,
        difficulty,
        dimensions,
        question: questionText,
        options,
        correctAnswer: answer
      })
    }
    return questions
  }

  const ugQuestions = parseBank(ugSection, 'UG')
  const pgQuestions = parseBank(pgSection, 'PG')
  
  console.log(`Parsed ${ugQuestions.length} UG questions and ${pgQuestions.length} PG questions.`)
  
  // Verify distribution per level
  const ugLevels = {}
  ugQuestions.forEach(q => ugLevels[q.level] = (ugLevels[q.level] || 0) + 1)
  console.log('UG Level Distribution:', ugLevels)
  
  const pgLevels = {}
  pgQuestions.forEach(q => pgLevels[q.level] = (pgLevels[q.level] || 0) + 1)
  console.log('PG Level Distribution:', pgLevels)
  
  return { ugQuestions, pgQuestions }
}

const result = parseQuestionBank(content)
