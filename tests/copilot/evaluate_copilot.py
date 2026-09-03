import sys
import os
import json
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app.ai_agent import ai_agent

def run_evaluation():
    json_path = os.path.join(os.path.dirname(__file__), 'copilot_test_cases.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        test_cases = json.load(f)

    total_tests = len(test_cases)
    intent_correct = 0
    grounded_correct = 0
    source_correct = 0
    hallucination_count = 0
    unsupported_correct = 0
    unsupported_total = 0
    passing_tests = 0

    print("=== ETS AI COPILOT EVALUATION SUITE ===")
    print(f"Total Test Scenarios: {total_tests}\n")

    for tc in test_cases:
        q_id = tc['id']
        question = tc['question']
        exp_intent = tc['expected_intent']
        exp_source = tc['expected_source']
        val_rule = tc['validation_rule'].lower()

        res = ai_agent.process_query(question)
        actual_intent = res.get('intent', '')
        actual_source = res.get('source', '')
        answer_text = res.get('answer', '')

        # Check intent match
        intent_match = (actual_intent == exp_intent) or (exp_intent in ['TECHNICAL_SKILL_ANALYSIS', 'SKILL_ANALYSIS'] and actual_intent in ['TECHNICAL_SKILL_ANALYSIS', 'SKILL_ANALYSIS']) or (exp_intent in ['LEAVE_ANALYSIS', 'CALENDAR_ANALYSIS'] and actual_intent in ['LEAVE_ANALYSIS', 'CALENDAR_ANALYSIS'])
        if intent_match:
            intent_correct += 1

        # Check source match
        source_match = (exp_source in actual_source) or (actual_source in exp_source)
        if source_match:
            source_correct += 1

        # Check data grounding validation rule
        grounded_match = val_rule in answer_text.lower() or val_rule in json.dumps(res).lower()
        if grounded_match:
            grounded_correct += 1

        # Hallucination check for unsupported questions
        if tc['category'] == 'UNSUPPORTED_QUERY':
            unsupported_total += 1
            if "couldn't find" in answer_text.lower() or "not exist" in answer_text.lower() or "unsupported" in answer_text.lower():
                unsupported_correct += 1
            else:
                hallucination_count += 1

        is_pass = intent_match and grounded_match
        if is_pass:
            passing_tests += 1

        status_str = "PASS" if is_pass else "FAIL"
        print(f"[{status_str}] {q_id}: \"{question}\"")
        print(f"   Intent: Expected={exp_intent} | Actual={actual_intent}")
        print(f"   Source: {actual_source}")
        print(f"   Answer Snippet: {answer_text[:75]}...\n")

    intent_acc = (intent_correct / total_tests) * 100
    grounded_acc = (grounded_correct / total_tests) * 100
    source_acc = (source_correct / total_tests) * 100
    overall_acc = (passing_tests / total_tests) * 100
    unsupported_acc = (unsupported_correct / unsupported_total * 100) if unsupported_total > 0 else 100.0

    print("==================================================")
    print("EVALUATION RESULTS SUMMARY")
    print("==================================================")
    print(f"Total Questions Tested    : {total_tests}")
    print(f"Passed Scenarios          : {passing_tests}")
    print(f"Failed Scenarios          : {total_tests - passing_tests}")
    print(f"Overall Accuracy          : {overall_acc:.1f}%")
    print(f"Intent Accuracy           : {intent_acc:.1f}%")
    print(f"Data Grounding Accuracy   : {grounded_acc:.1f}%")
    print(f"API Source Accuracy       : {source_acc:.1f}%")
    print(f"Unsupported Query Accuracy: {unsupported_acc:.1f}%")
    print(f"Hallucination Count       : {hallucination_count} (Target: 0)")
    print("==================================================\n")

if __name__ == '__main__':
    run_evaluation()
