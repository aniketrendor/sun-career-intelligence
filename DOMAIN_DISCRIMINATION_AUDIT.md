# Stage 1 Domain Discrimination & Pairwise Separation Audit

**Total Domain Pairs Evaluated:** 105 Domain Pairs (15 × 15 Matrix)  
**Scoring Architecture:** 15 University Course Family Suitability Formulas  

---

## 1. Executive Summary: Pairwise Separation Capability

- **Strongly Separated Pairs (High Δ ≥ 0.55):** 0 pairs (0.0%)
- **Moderately Separated Pairs (Medium 0.25 ≤ Δ < 0.55):** 0 pairs (0.0%)
- **Critically Weak Separation Pairs (Low Δ < 0.25):** 105 pairs (100.0%)

---

## 2. Five Weakest Domain Pairs (Prone to Severe Tie / Ambiguity)

| Rank | Competing Domain Pair | Weight Vector Dist. | Avg Suitability Δ | Discrimination Power | Root Cause Analysis & Scoring Overlap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Math & Statistics ↔ Natural Science** | 1.41 | **0.023** | ⚠️ **LOW** | High dimension weight overlap (shared AR, LR, TC, BU, SO weights). Questions must introduce discriminating trade-offs. |
| 2 | **Natural Science ↔ Life Science** | 2.45 | **0.027** | ⚠️ **LOW** | High dimension weight overlap (shared AR, LR, TC, BU, SO weights). Questions must introduce discriminating trade-offs. |
| 3 | **AI & Data ↔ Engineering** | 3 | **0.032** | ⚠️ **LOW** | High dimension weight overlap (shared AR, LR, TC, BU, SO weights). Questions must introduce discriminating trade-offs. |
| 4 | **Management ↔ Hospitality & Tourism** | 2 | **0.032** | ⚠️ **LOW** | High dimension weight overlap (shared AR, LR, TC, BU, SO weights). Questions must introduce discriminating trade-offs. |
| 5 | **Computing & IT ↔ AI & Data** | 2.45 | **0.034** | ⚠️ **LOW** | High dimension weight overlap (shared AR, LR, TC, BU, SO weights). Questions must introduce discriminating trade-offs. |

---

## 3. Five Strongest Domain Pairs (Crisp, High Separation)

| Rank | Competing Domain Pair | Weight Vector Dist. | Avg Suitability Δ | Discrimination Power | Separation Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Math & Statistics ↔ Hospitality & Tourism** | 9.27 | **0.151** | ✅ **LOW** | Polar opposite dimension priorities (e.g. Pure Quantitative/Lab Science vs Pure Creative/Social). |
| 2 | **Math & Statistics ↔ Media & Communication** | 8.31 | **0.143** | ✅ **LOW** | Polar opposite dimension priorities (e.g. Pure Quantitative/Lab Science vs Pure Creative/Social). |
| 3 | **Natural Science ↔ Hospitality & Tourism** | 8.94 | **0.14** | ✅ **LOW** | Polar opposite dimension priorities (e.g. Pure Quantitative/Lab Science vs Pure Creative/Social). |
| 4 | **Math & Statistics ↔ Humanities** | 8.72 | **0.139** | ✅ **LOW** | Polar opposite dimension priorities (e.g. Pure Quantitative/Lab Science vs Pure Creative/Social). |
| 5 | **Math & Statistics ↔ Commerce & Finance** | 7.62 | **0.138** | ✅ **LOW** | Polar opposite dimension priorities (e.g. Pure Quantitative/Lab Science vs Pure Creative/Social). |

---

## 4. 15 × 15 Pairwise Domain Separation Matrix (Δ Score / Power)

| Domain | Computin | AI & Dat | Engineer | Math & S | Natural  | Life Sci | Commerce | Manageme | Economic | Humaniti | Social S | Media &  | Design & | Law | Hospital |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Computing & IT** | - | 0.03 (L) | 0.04 (L) | 0.07 (L) | 0.07 (L) | 0.08 (L) | 0.11 (L) | 0.09 (L) | 0.06 (L) | 0.12 (L) | 0.09 (L) | 0.12 (L) | 0.09 (L) | 0.07 (L) | 0.12 (L) |
| **AI & Data** | 0.03 (L) | - | 0.03 (L) | 0.04 (L) | 0.04 (L) | 0.05 (L) | 0.12 (L) | 0.10 (L) | 0.05 (L) | 0.12 (L) | 0.09 (L) | 0.12 (L) | 0.10 (L) | 0.08 (L) | 0.13 (L) |
| **Engineering** | 0.04 (L) | 0.03 (L) | - | 0.05 (L) | 0.05 (L) | 0.06 (L) | 0.10 (L) | 0.09 (L) | 0.05 (L) | 0.12 (L) | 0.08 (L) | 0.11 (L) | 0.09 (L) | 0.07 (L) | 0.11 (L) |
| **Math & Statistics** | 0.07 (L) | 0.04 (L) | 0.05 (L) | - | 0.02 (L) | 0.04 (L) | 0.14 (L) | 0.13 (L) | 0.07 (L) | 0.14 (L) | 0.10 (L) | 0.14 (L) | 0.13 (L) | 0.10 (L) | 0.15 (L) |
| **Natural Science** | 0.07 (L) | 0.04 (L) | 0.05 (L) | 0.02 (L) | - | 0.03 (L) | 0.13 (L) | 0.12 (L) | 0.06 (L) | 0.12 (L) | 0.09 (L) | 0.13 (L) | 0.11 (L) | 0.09 (L) | 0.14 (L) |
| **Life Science** | 0.08 (L) | 0.05 (L) | 0.06 (L) | 0.04 (L) | 0.03 (L) | - | 0.13 (L) | 0.11 (L) | 0.07 (L) | 0.10 (L) | 0.07 (L) | 0.11 (L) | 0.10 (L) | 0.08 (L) | 0.13 (L) |
| **Commerce & Finance** | 0.11 (L) | 0.12 (L) | 0.10 (L) | 0.14 (L) | 0.13 (L) | 0.13 (L) | - | 0.06 (L) | 0.08 (L) | 0.09 (L) | 0.08 (L) | 0.07 (L) | 0.08 (L) | 0.07 (L) | 0.07 (L) |
| **Management** | 0.09 (L) | 0.10 (L) | 0.09 (L) | 0.13 (L) | 0.12 (L) | 0.11 (L) | 0.06 (L) | - | 0.08 (L) | 0.07 (L) | 0.06 (L) | 0.06 (L) | 0.04 (L) | 0.04 (L) | 0.03 (L) |
| **Economics** | 0.06 (L) | 0.05 (L) | 0.05 (L) | 0.07 (L) | 0.06 (L) | 0.07 (L) | 0.08 (L) | 0.08 (L) | - | 0.10 (L) | 0.06 (L) | 0.10 (L) | 0.09 (L) | 0.05 (L) | 0.10 (L) |
| **Humanities** | 0.12 (L) | 0.12 (L) | 0.12 (L) | 0.14 (L) | 0.12 (L) | 0.10 (L) | 0.09 (L) | 0.07 (L) | 0.10 (L) | - | 0.04 (L) | 0.04 (L) | 0.05 (L) | 0.06 (L) | 0.06 (L) |
| **Social Science** | 0.09 (L) | 0.09 (L) | 0.08 (L) | 0.10 (L) | 0.09 (L) | 0.07 (L) | 0.08 (L) | 0.06 (L) | 0.06 (L) | 0.04 (L) | - | 0.04 (L) | 0.04 (L) | 0.04 (L) | 0.06 (L) |
| **Media & Communication** | 0.12 (L) | 0.12 (L) | 0.11 (L) | 0.14 (L) | 0.13 (L) | 0.11 (L) | 0.07 (L) | 0.06 (L) | 0.10 (L) | 0.04 (L) | 0.04 (L) | - | 0.04 (L) | 0.06 (L) | 0.04 (L) |
| **Design & Creative** | 0.09 (L) | 0.10 (L) | 0.09 (L) | 0.13 (L) | 0.11 (L) | 0.10 (L) | 0.08 (L) | 0.04 (L) | 0.09 (L) | 0.05 (L) | 0.04 (L) | 0.04 (L) | - | 0.05 (L) | 0.04 (L) |
| **Law** | 0.07 (L) | 0.08 (L) | 0.07 (L) | 0.10 (L) | 0.09 (L) | 0.08 (L) | 0.07 (L) | 0.04 (L) | 0.05 (L) | 0.06 (L) | 0.04 (L) | 0.06 (L) | 0.05 (L) | - | 0.06 (L) |
| **Hospitality & Tourism** | 0.12 (L) | 0.13 (L) | 0.11 (L) | 0.15 (L) | 0.14 (L) | 0.13 (L) | 0.07 (L) | 0.03 (L) | 0.10 (L) | 0.06 (L) | 0.06 (L) | 0.04 (L) | 0.04 (L) | 0.06 (L) | - |

*(Key: H = High Separation, M = Medium Separation, L = Low Separation / High Risk of Ambiguity)*

---

## 5. Domain Coverage Matrix (Level × Domain Contributing Questions)

| Domain Name | L1 Orientation | L2 Reasoning | L3 Applied | L4 Differentiation | L5 Validation | Total Contributing | Avg Signal Strength |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Computing & IT** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **AI & Data** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Engineering** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Math & Statistics** | 0 | 1 | 0 | 0 | 0 | **1** | 1.22 / 5.0 |
| **Natural Science** | 0 | 1 | 0 | 0 | 0 | **1** | 1.25 / 5.0 |
| **Life Science** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Commerce & Finance** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Management** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Economics** | 0 | 1 | 0 | 0 | 0 | **1** | 1.22 / 5.0 |
| **Humanities** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Social Science** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Media & Communication** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Design & Creative** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Law** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
| **Hospitality & Tourism** | 0 | 0 | 0 | 0 | 0 | **0** | 0 / 5.0 |
