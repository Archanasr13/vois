import os
import json
from datetime import datetime
import hashlib

OPENAI_KEY = os.environ.get('OPENAI_API_KEY') or os.environ.get('AZURE_OPENAI_KEY')
AZURE_TTS_KEY = os.environ.get('AZURE_TTS_KEY')
AZURE_TTS_REGION = os.environ.get('AZURE_TTS_REGION')


def _safe_hash_marker(user_id):
    # create a hashed marker to indicate credential presence without storing secrets
    return hashlib.sha256(f"marker:{user_id}:{int(datetime.utcnow().timestamp())}".encode()).hexdigest()


def generate_summary(metrics_json):
    """Generate an executive summary for given metrics.
    If OPENAI_KEY is configured, call the LLM (caller must implement actual call).
    Fallback: deterministic template-based summary.
    """
    # Minimal template fallback
    try:
        m = metrics_json or {}
        org = m.get('organization', 'The organization')
        phr = m.get('phishing_click_rate', None)
        avg = m.get('avg_quiz_score', None)
        dept_high = m.get('high_risk_departments', [])

        parts = []
        if phr is not None:
            parts.append(f"Phishing click rate over the period is {round(phr*100,1)}%.")
        if avg is not None:
            parts.append(f"Average quiz score is {int(avg)}%.")
        if dept_high:
            parts.append(f"Departments with elevated risk: {', '.join(dept_high[:3])}.")

        parts.append("Recommended actions: run targeted training for the highest-risk departments; enable multifactor authentication where absent; schedule a follow-up assessment in 30 days.")

        return ' '.join(parts)
    except Exception:
        return "The system could not generate a summary at this time."


def generate_quiz(user_context, num_questions=5):
    """Generate quiz questions. If no LLM is available, select from user_context['pool'] or return simple templated questions.
    user_context may contain keys: weak_topics (list), pool (list of question dicts)
    Returns list of question dicts.
    """
    pool = user_context.get('pool') or []
    weak = user_context.get('weak_topics') or []
    out = []
    if pool:
        # prioritize pool entries matching weak topics
        prioritized = [q for q in pool if any(t in (q.get('category') or '').lower() for t in weak)]
        chosen = prioritized[:num_questions]
        if len(chosen) < num_questions:
            # fill from remaining
            rest = [q for q in pool if q not in chosen]
            chosen += rest[:(num_questions - len(chosen))]
        for q in chosen:
            out.append({
                'id': q.get('id'),
                'question': q.get('question'),
                'choices': q.get('choices') or q.get('options') or [],
                'correct_choice_id': q.get('correct_index') or q.get('correct_option'),
                'explanation': q.get('explanation')
            })
        return out

    # fallback synthetic questions
    for i in range(num_questions):
        out.append({
            'id': f'adapt-{int(datetime.utcnow().timestamp())}-{i}',
            'question': f"Which of the following is the best practice when receiving unexpected emails? (sample {i+1})",
            'choices': [
                {'id': 0, 'text': 'Click the link immediately'},
                {'id': 1, 'text': 'Verify sender and hover links'},
                {'id': 2, 'text': 'Reply with credentials'},
                {'id': 3, 'text': 'Forward to entire team'}
            ],
            'correct_choice_id': 1,
            'explanation': 'Hovering and verifying the sender helps detect phishing.'
        })
    return out


def generate_awareness_script(context):
    """Generate a short (30-60s) awareness script. If LLM available, call it; fallback to template.
    context fields: user_name, action, simulation_type, department
    """
    try:
        action = context.get('action', 'an unsafe action')
        sim = context.get('simulation_type', 'a phishing email')
        dept = context.get('department', 'your department')
        tips = context.get('tips') or ['Verify sender addresses', 'Hover links before clicking', 'Report suspicious messages to IT']

        script = (
            f"This is a short security briefing for {dept} team members. You recently performed {action} on {sim}. "
            f"Such actions can expose credentials or systems to attackers.\n\nHere are three quick tips: {tips[0]}; {tips[1]}; {tips[2]}. "
            "Remember: when in doubt, report it to your security team."
        )
        return script
    except Exception:
        return "We could not generate awareness content at this time."


def generate_tts(script_text, user_id=None):
    """Generate a pseudo-audio file for the script if TTS not configured we write a .txt fallback file and return its URL.
    If AZURE_TTS_KEY and REGION are present, a real TTS call would be made here.
    """
    static_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'awareness_audio')
    os.makedirs(static_dir, exist_ok=True)
    safe_name = f"awareness_{user_id or 'anon'}_{int(datetime.utcnow().timestamp())}"
    txt_path = os.path.join(static_dir, safe_name + '.txt')
    try:
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(script_text)
        # return relative URL path for frontend to load (static served by Flask)
        return f"/static/awareness_audio/{safe_name}.txt"
    except Exception:
        return None


def llm_available():
    return bool(OPENAI_KEY)
