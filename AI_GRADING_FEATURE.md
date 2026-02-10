# AI-Powered Quiz Grading Feature

## What's New?

I've added an AI-powered grading system to your quiz mode that provides:

1. **Detailed Feedback** - Explains what's right and wrong
2. **Partial Credit** - Recognizes when students get the answer right for the wrong reasons (or vice versa)
3. **Reasoning Analysis** - Identifies misconceptions in student thinking
4. **Educational Suggestions** - Helps students understand what to focus on

## How It Works

### For Students Taking Quizzes:

1. **Start a Quiz** - Click "Quiz Mode" on any study set
2. **Enable AI Grading** - Toggle the "AI-Powered Grading" switch at the top (must be done before starting)
3. **Answer Questions** - Type your answer and click "Submit Answer"
4. **Get Instant Feedback** - AI will:
   - Give you a score out of 100
   - Mark as Correct / Partial Credit / Incorrect
   - Explain your reasoning
   - Suggest what to improve

### Example Scenario:

**Question:** Is y=x² linear or nonlinear?

**Student Answer:** "non linear because the y value would increase at a constant rate"

**AI Grading Result:**
- **Score:** 50/100
- **Status:** Partial Credit ⚠️
- **Feedback:** "You correctly identified this as nonlinear! However, your reasoning is backwards. A constant rate of increase describes LINEAR relationships. For y=x², the rate of change INCREASES as x increases (1→1, 2→4, 3→9), which makes it nonlinear."
- **Reasoning Analysis:** "You have the answer correct but your justification contradicts it. This suggests you may have guessed or memorized the answer without fully understanding the concept."
- **Suggestions:** "Focus on understanding what 'rate of change' means. Try plotting a few points to see how linear vs nonlinear functions behave differently."

## Implementation Details

### New Files Created:

1. **`src/app/api/grade-answer/route.ts`** - API endpoint for AI grading
   - Uses Claude Haiku for cost-effective grading (~$0.001 per answer)
   - Returns detailed feedback, score, and suggestions

### Files Modified:

1. **`src/components/QuizMode.tsx`**
   - Added AI grading toggle
   - Shows detailed feedback during quiz
   - Displays partial credit scores
   - Comprehensive results page with reasoning analysis

### Key Features:

- **Toggle Switch** - Turn AI grading on/off (can only change before starting quiz)
- **Loading State** - Shows "AI Grading..." while processing
- **Fallback** - If AI grading fails, falls back to standard fuzzy matching
- **Partial Credit** - Three states: Correct (100), Partial (50-99), Incorrect (0-49)
- **Visual Feedback**:
  - Green = Correct ✓
  - Yellow = Partial Credit ⚠️
  - Red = Incorrect ✗

## Cost Analysis

**Claude Haiku API Costs:**
- ~200 tokens input per question
- ~150 tokens output per grading
- **Total: ~$0.001 per question graded**

**For a 20-question quiz:**
- Standard grading: Free (but only exact/fuzzy matching)
- AI grading: ~$0.02 (but provides educational feedback)

## Testing the Feature

1. **Run the build:**
   ```bash
   npm run build
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Test with a quiz:**
   - Upload a PDF with test questions (or use existing study set)
   - Generate flashcards
   - Click "Quiz Mode"
   - **Turn ON the AI Grading toggle**
   - Answer a few questions with intentionally wrong reasoning
   - See the detailed AI feedback

4. **Example test cases:**
   - Right answer, wrong reason (partial credit)
   - Wrong answer, right approach (partial credit)
   - Completely correct (100%)
   - Completely wrong (0%)

## Next Steps

- Test the build (run `build-test.bat`)
- Try the feature with real quiz questions
- Adjust AI feedback prompts if needed
- Monitor API costs in Anthropic dashboard

## Benefits

This feature is perfect for:
- **Math/Science quizzes** - Where students can get answers right for wrong reasons
- **Conceptual questions** - Where understanding matters more than memorization
- **Self-study** - Students get immediate, detailed feedback without waiting for a teacher
- **Learning from mistakes** - AI explains exactly what went wrong and how to improve

The AI grading makes your study assistant truly educational, not just a flashcard memorizer!
