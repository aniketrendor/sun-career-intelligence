# STAGE 1 RESULT PIPELINE ROOT CAUSE REPORT
**Career Intelligence System — Undergraduate & Postgraduate Diagnostic Platform**
**Audit Timestamp:** 2026-10-08T18:12:00+05:30
**Audit Status:** COMPLETE & VERIFIED

---

## 1. Executive Summary & Problem Statement

During live assessment evaluations of the Stage 1 UG Diagnostic System, a severe result pipeline inconsistency was observed on the final student diagnostic report screen. Despite candidates exhibiting distinct response behaviors across various career families (such as **Hospitality & Tourism**, **Commerce & Finance**, and **Management**), the headline specialization card consistently displayed:

> **Headline Specialization:** "Technology Management & Business Analytics (29%)"
> **Degree Program:** BCA & B.Tech Integrated · School of Commerce & Management Studies
> **Top 3 Displayed Domains:**
> - Rank #1: Hospitality & Tourism (29%) → Displayed Pathway: *B.Tech CSE (AI & ML) / Software Engineering*
> - Rank #2: Commerce & Finance (28%) → Displayed Pathway: *B.Tech Cloud Systems & Cyber Defense / Robotics*
> - Rank #3: Management (28%) → Displayed Pathway: *BCA & B.Tech Integrated / Business Analytics*

This generated severe logical contradictions where a student with highest affinity in Hospitality & Tourism was recommended a B.Tech in CSE, paired with a cognitive decomposition rationale belonging to computer engineering.

---

## 2. Root Cause Analysis & Code Audit

A systematic, end-to-end investigation across the assessment pipeline (from question option selection to UI component rendering) identified four primary root causes:

### Root Cause 1: Static Fallback in Report Specialization Resolution
**File:** `src/app/student/fresher/report/page.tsx` (Lines 110–135)
**Defect:**
The frontend report page attempted to resolve the student's optimal specialization via simplistic string inclusion on `topDomain`:
```typescript
// IN THE ORIGINAL CODE:
if (topDomain.includes('AI') || topDomain.includes('Data')) {
  optimalSpecialization = { title: 'Artificial Intelligence & Machine Learning', school: 'School of Computing Sciences' }
} else if (topDomain.includes('Cloud') || topDomain.includes('Cyber')) {
  optimalSpecialization = { title: 'Cloud Computing & Cyber Security', school: 'School of Computing Sciences' }
} else {
  optimalSpecialization = {
    title: 'Technology Management & Business Analytics',
    school: 'School of Commerce & Management Studies',
    degree: 'BCA & B.Tech Integrated',
  }
}
```
**Impact:** Any student whose Top 1 domain was not string-matched to "AI", "Data", "Cloud", or "Cyber" fell directly into the hardcoded `else` branch, forcibly rendering **"Technology Management & Business Analytics"** regardless of their true aptitude in Law, Design, Hospitality, Science, or Humanities.

---

### Root Cause 2: Array-Index & Rank-Template Course Pathway Binding
**File:** `src/app/student/fresher/report/page.tsx` (Lines 80–108)
**Defect:**
The 3 rendered career domain cards did not look up the domain's corresponding faculty and degree from a domain registry. Instead, degree pathways and cognitive descriptions were hardcoded by array rank position:
- `Rank #1` unconditionally assigned `"B.Tech CSE (AI & ML) / Software Engineering"` and `"Highest cognitive affinity, structured logic, and technical problem decomposition instincts."`
- `Rank #2` unconditionally assigned `"B.Tech Cloud Systems & Cyber Defense / Robotics"` and `"Robust analytical capacity and quantitative modeling suitable for advanced systems architecture."`
- `Rank #3` unconditionally assigned `"BCA & B.Tech Integrated / Business Analytics"` and `"Complementary commercial acumen, strategic decision reasoning, and leadership aptitude."`

**Impact:** Regardless of whether Rank #1 was Hospitality & Tourism, Law, or Fine Arts, the UI displayed technical computer science degrees and software engineering descriptions.

---

### Root Cause 3: Default Specialization Payload in Lead Submission
**File:** `src/app/student/fresher/test/page.tsx` (Lines 120–145)
**Defect:**
In `executeFinalSubmission`, when syncing the assessment lead to Supabase/CRM, `recommendedSpec` defaulted to `"B.Tech Computer Science & Engineering (AI & ML)"` whenever an explicit interdisciplinary resolver was absent.

---

### Root Cause 4: Integer Rounding Ties in Domain Suitability Scoring
**File:** `src/lib/engines/stage1-bank-data.ts` (`calculateStage1Suitability`)
**Defect:**
When computing suitability scores $S_c = \frac{\sum (D_d \times W_{c,d})}{\sum W_{c,d}}$, the raw weighted score was immediately rounded with `Math.round()` prior to sorting. When two domains produced identical rounded integer scores (e.g., 50.4% vs 49.6% both rounding to 50%), tie-breaking defaulted to array order in `COURSE_FAMILY_MATRIX`, occasionally inverting close rankings.

---

## 3. Affected Components & Pipeline Map

```
[Assessment Options Selection] (UG001 - UG065)
          │
          ▼
[processAssessmentResponses] (Engine 1)
  - Raw dimension accumulation
  - Normalized trait scores (0-100)
          │
          ▼
[calculateStage1Suitability] (Engine 2)
  - [FIXED]: Exact floating-point suitability sorting
          │
          ▼
[stage1-domain-pathway-mapper] (NEW SINGLE SOURCE OF TRUTH)
  - DOMAIN_REGISTRY: 15 Permanent Domain IDs
  - resolveOptimalSpecialization(d1, d2, d3): Interdisciplinary Synergies
  - getDomainCardData(domainKey, score, rank): Domain-specific cards
          │
          ▼
[Report UI & Lead Sync]
  - report/page.tsx: Consumes canonical domain card & specialization data
  - test/page.tsx: Syncs true resolved specialization
```

---

## 4. Verification

The root cause was isolated and eradicated through the creation of a centralized Domain Pathway Mapper engine (`stage1-domain-pathway-mapper.ts`), complete elimination of hardcoded defaults, and binding of every UI field to canonical domain metadata.
