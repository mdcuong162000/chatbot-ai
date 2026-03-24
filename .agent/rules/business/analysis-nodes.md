# 🤖 AI ANALYSIS NODES: SPECIALIZED COG-THOUGHT (V1.0)

To maximize the effectiveness of AI ad analysis, we avoid "Generalist Prompts". Instead, every creative is passed through a **Modular Chain of Thought** consisting of 3 specialized analysis nodes:

## 1. 🎨 Creative & Copy Specialist (Phòng Sáng tạo)
- **Role**: Analyzes the "Hook", "Visual", and "Ad Copy".
- **Focus**: Does the image grab attention? Is the headline compelling? Is the message clear?
- **Output**: Evaluation of the creative quality (Scale 1-10) and specific hook improvement advice.

## 2. 📊 Performance Data Analyst (Phòng Phân tích Số liệu)
- **Role**: Analyzes ROAS, CTR, CPC, CPA, and Spend.
- **Focus**: Statistical significance of the data. Is the ROAS healthy? Is the CPA within the target range?
- **Output**: Profitability assessment and spend-scaling recommendations.

## 3. 🎯 Strategic Marketing Director (Giám đốc Chiến lược)
- **Role**: Synthesizes inputs from the first two departments.
- **Focus**: The big picture. "Data says X, Creative says Y -> Strategy is Z".
- **Final Output**: 3 actionable bullet points for the user (The "So What?").

---

## 🛠️ Tech Implementation (RARV Engine)
When calling `runCreativeAnalysis`:
1.  **Stage 1**: Call Gemini for specialized Creative analysis.
2.  **Stage 2**: Pass Stage 1 results + Raw Data to Stage 2 for Strategic Synthesis.
3.  **Fallback**: Use OpenAI or Mock if Gemini fails, but still following the "Departmental" reasoning structure.
