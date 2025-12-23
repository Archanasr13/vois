from flask import Blueprint, request, jsonify
from models import db, User, QuizQuestion, QuizResult
from utils.ai_helpers import generate_quiz
from datetime import datetime, timezone
import json

bp = Blueprint('ai_quiz', __name__)


@bp.route('/api/ai/quiz', methods=['POST'])
def ai_quiz():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    num = int(data.get('num_questions', 5))

    # fetch user context (weak topics) if exists
    user = User.query.get(user_id) if user_id else None
    weak = []
    try:
        prof = db.session.query().filter().first()
    except Exception:
        prof = None

    # build pool from QuizQuestion table
    pool = []
    for q in QuizQuestion.query.all():
        try:
            opts = json.loads(q.options) if isinstance(q.options, str) else q.options
        except Exception:
            opts = []
        pool.append({
            'id': q.id,
            'question': q.question,
            'choices': [{'id': idx, 'text': t} for idx, t in enumerate(opts)],
            'correct_index': q.correct_option,
            'explanation': q.explanation,
            'category': (q.category or '').lower()
        })

    user_context = {'weak_topics': weak, 'pool': pool}
    generated = generate_quiz(user_context, num_questions=num)

    # cache simple QuizResult entry to represent generated quiz (not graded yet)
    # For this demo we return correct_choice_id too (remove in production)
    return jsonify({'quiz': generated})
