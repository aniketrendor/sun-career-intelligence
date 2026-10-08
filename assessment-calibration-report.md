# Stage 1 Assessment Architecture Calibration & 500-Question Blueprint

**Document Version:** 2.0-CALIBRATED  
**Date:** 2026-10-08T06:54:00.177Z  
**Authoritative Standards:** 12 Assessment Dimensions · 15 Course Families · 5 Progressive Levels  
**Architecture Scope:** Complete Calibration Layer + 500-Question Expansion Blueprint (250 UG + 250 PG)  

---

## 1. Executive Summary & Diagnostic Verification

| Audit Diagnostic Metric | Measured Value | Architecture Action Implemented |
| :--- | :--- | :--- |
| **Total Questions Audited** | **130 Questions** (65 UG + 65 PG) | Preserved V1 Original intact; constructed V2 Calibrated Layer |
| **Questions Requiring Recalibration** | **38 / 130 (29.2%)** | Pruned secondary noise weights; capped to 3 primary dimensions per option |
| **Options Exceeding 3-Dimension Limit** | **38 Questions** | Enforced 3-dimension maximum rule; multi-dimensional allowed only in Level 5 |
| **Questions with Incorrect AR Usage** | **67 Questions** | Restricted AR strictly to analytical decomposition & pattern evaluation |
| **Questions with Incorrect PS Usage** | **62 Questions** | Restricted PS strictly to explicit problem resolution & troubleshooting |
| **Question Similarity Pairs ($ge 0.80$)** | **121 Pairs** | Tagged similarity groups in 500-question blueprint to prevent redundant clones |
| **PG Bank Critical Deficit** | **LR: 1 Q, CR: 5 Qs, TC: 9 Qs** | Generated targeted PG quotas: +37 LR, +33 CR, +29 TC in new blueprint |
| **Future 500-Question Bank Quota** | **250 UG + 250 PG (50 / Level)** | Full 500-slot blueprint mapped with domains, dimensions & trade-offs |
| **Forced-Choice Scenario Density** | **200 / 500 (40.0%)** | 100% of Level 4 and Level 5 questions engineered as forced-choice trade-offs |

---

## 2. Answers to 12 Core Architecture Questions

### Q1: How many questions require evidence recalibration?
**38 out of 130 questions (29.2%)** require option evidence recalibration. The primary issue is that 75 questions in the existing pool activate 4 to 9 dimensions simultaneously on single options, which diffuses discriminative power.

### Q2: How many questions exceed the 3-dimension option limit?
**38 questions** contain at least one option activating $> 3$ dimensions. In the Calibrated V2 layer, each option is constrained to at most 3 focused dimensions.

### Q3: Which questions incorrectly use AR?
**67 questions** assign AR (+5 or +4) without an analytical decomposition construct in the prompt (e.g. `UG001`, `UG002`, `UG008`, `UG011`, `UG014`, `UG020`, `PG005`, `PG014`, `PG032`). In V2, AR is removed unless the question specifically requires breaking down a system, comparing hypotheses, or evaluating underlying assumptions.

### Q4: Which questions incorrectly use PS?
**62 questions** assign PS (+5 or +4) to general preference or broad orientation items where no problem or obstacle is being solved (e.g. `UG001`, `UG003`, `UG006`, `UG013`, `UG047`, `UG052`, `PG003`, `PG035`). In V2, PS is restricted to troubleshooting, optimization, and practical solution generation.

### Q5: Which domain pairs require dedicated discrimination?
Eight domain pairs require explicit forced-choice discrimination:
1. **Math & Statistics vs Natural Science** (Distinguishing: `QR` vs `SC`)
2. **Natural Science vs Life Science** (Distinguishing: `SC` vs `RE`)
3. **AI & Data vs Engineering** (Distinguishing: `TC` vs `PS`)
4. **Management vs Hospitality & Tourism** (Distinguishing: `BU` vs `SO`)
5. **Computing & IT vs AI & Data** (Distinguishing: `TC` vs `QR`)
6. **Law vs Social Science** (Distinguishing: `LR` vs `SO`)
7. **Design & Creative vs Media & Communication** (Distinguishing: `CR` vs `CO`)
8. **Commerce & Finance vs Economics** (Distinguishing: `BU` vs `AR`)

### Q6: How many future questions are required for each dimension?
To achieve a gold-standard benchmark of 35–40 questions per dimension across 250 questions per track:
- **PG Track**: **LR (+37)**, **CR (+33)**, **TC (+29)**, **SO (+27)**, **BU (+23)**, **LE (+22)**, **CO (+21)**, **QR (+19)**, **SC (+19)**.
- **UG Track**: **LR (+24)**, **LE (+24)**, **BU (+23)**, **TC (+23)**, **CR (+16)**, **QR (+16)**, **SO (+13)**, **SC (+12)**.

### Q7: How many future questions are required at each level?
Each track currently has 13 questions per level (65 total). To reach 50 questions per level (250 total per track):
- **Level 1 (Orientation):** +37 questions (UG: 37, PG: 37)
- **Level 2 (Reasoning):** +37 questions (UG: 37, PG: 37)
- **Level 3 (Applied Practice):** +37 questions (UG: 37, PG: 37)
- **Level 4 (Differentiation):** +37 questions (UG: 37, PG: 37)
- **Level 5 (Validation):** +37 questions (UG: 37, PG: 37)
- **Total New Questions to Generate:** **370 Questions** (185 UG + 185 PG).

### Q8: What percentage of the new bank should be forced-choice?
**40.0% of the 500-question bank (200 / 500 slots)** will be forced-choice trade-off scenarios. Specifically, **100% of Level 4 (Differentiation)** and **100% of Level 5 (Validation)** questions are engineered as forced-choice trade-offs.

### Q9: Which existing questions should be retained unchanged?
**30 questions** have clean, focused dimension profiles and sharp domain discrimination (e.g. `UG019`, `UG030`, `UG031`, `UG043`, `UG060`, `PG011`, `PG018`, `PG025`, `PG054`, `PG056`, `PG059`).

### Q10: Which existing questions should be redesigned?
**14 questions** have heavy multi-dimension sprawl ($ge 8$ dimensions) or flat zero-delta cross-domain signals (e.g. `UG005`, `UG010`, `UG016`, `UG020`, `UG022`).

### Q11: Which questions should become validation-only questions?
**0 Level 5 questions** that test high cognitive depth without explicit pairwise contrast will serve as validation anchors in the adaptive pool.

### Q12: What is the recommended architecture for the 500-question bank?
A 5-tier adaptive pyramid:
1. **Tier 1 (L1 - 100 Qs):** Broad Vocational Preference & Learning Style Discovery (1–2 dims/option).
2. **Tier 2 (L2 - 100 Qs):** Foundational Deductive & Quantitative Reasoning (Objective logic & math patterns).
3. **Tier 3 (L3 - 100 Qs):** Applied Real-World Scenarios (Industry troubleshooting & domain execution).
4. **Tier 4 (L4 - 100 Qs):** Forced-Choice Two-Domain Discrimination (1.5× Discriminator Multiplier).
5. **Tier 5 (L5 - 100 Qs):** High-Complexity Multi-Disciplinary Strategic Trade-offs.

---

## 3. Quota Summary Tables

### UG Track Quota Allocation (Target: 250 Questions)
| Dimension | Current Count | Target Count | Deficit Needed | L1 Quota | L2 Quota | L3 Quota | L4 Quota | L5 Quota |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **AR** (Analytical Reasoning) | 60 | 38 | **+0** | +0 | +0 | +0 | +0 | +0 |
| **LR** (Logical Reasoning) | 14 | 38 | **+24** | +2 | +5 | +4 | +7 | +8 |
| **QR** (Quantitative Reasoning) | 22 | 38 | **+16** | +3 | +1 | +2 | +6 | +6 |
| **PS** (Problem Solving) | 54 | 38 | **+0** | +0 | +0 | +0 | +0 | +0 |
| **SC** (Scientific Thinking) | 26 | 38 | **+12** | +1 | +0 | +5 | +7 | +3 |
| **RE** (Research Orientation) | 32 | 38 | **+6** | +1 | +0 | +5 | +4 | +0 |
| **TC** (Technology Orientation) | 14 | 38 | **+24** | +1 | +3 | +8 | +7 | +7 |
| **CR** (Creativity) | 22 | 38 | **+16** | +0 | +0 | +8 | +6 | +8 |
| **CO** (Communication) | 29 | 38 | **+9** | +0 | +0 | +8 | +4 | +5 |
| **SO** (Social Orientation) | 25 | 38 | **+13** | +0 | +0 | +8 | +5 | +7 |
| **LE** (Leadership & Management) | 14 | 38 | **+24** | +3 | +3 | +7 | +6 | +7 |
| **BU** (Business Orientation) | 15 | 38 | **+23** | +4 | +2 | +7 | +7 | +5 |

### PG Track Quota Allocation (Target: 250 Questions)
| Dimension | Current Count | Target Count | Deficit Needed | L1 Quota | L2 Quota | L3 Quota | L4 Quota | L5 Quota |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **AR** (Analytical Reasoning) | 58 | 38 | **+0** | +0 | +0 | +0 | +0 | +0 |
| **LR** (Logical Reasoning) | 1 | 38 | **+37** | +7 | +8 | +8 | +8 | +8 |
| **QR** (Quantitative Reasoning) | 18 | 38 | **+20** | +5 | +2 | +6 | +4 | +5 |
| **PS** (Problem Solving) | 52 | 38 | **+0** | +0 | +0 | +0 | +0 | +0 |
| **SC** (Scientific Thinking) | 13 | 38 | **+25** | +6 | +7 | +5 | +3 | +6 |
| **RE** (Research Orientation) | 35 | 38 | **+3** | +2 | +4 | +0 | +0 | +0 |
| **TC** (Technology Orientation) | 8 | 38 | **+30** | +6 | +5 | +8 | +5 | +8 |
| **CR** (Creativity) | 5 | 38 | **+33** | +6 | +7 | +7 | +8 | +7 |
| **CO** (Communication) | 13 | 38 | **+25** | +4 | +6 | +6 | +7 | +4 |
| **SO** (Social Orientation) | 10 | 38 | **+28** | +7 | +6 | +4 | +8 | +5 |
| **LE** (Leadership & Management) | 8 | 38 | **+30** | +6 | +6 | +6 | +8 | +6 |
| **BU** (Business Orientation) | 13 | 38 | **+25** | +5 | +6 | +6 | +5 | +5 |
