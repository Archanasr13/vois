from flask import Blueprint, request, jsonify, current_app
from models import db, User, UserInteraction, QuizResult, AIReport
from utils.ai_helpers import generate_summary
from datetime import datetime, timedelta, timezone

bp = Blueprint('ai_report', __name__)


def _parse_period(period, start_date=None, end_date=None):
    now = datetime.now(timezone.utc)
    if period == '7d':
        return now - timedelta(days=7), now
    if period == '30d':
        return now - timedelta(days=30), now
    # custom
    try:
        sd = datetime.fromisoformat(start_date) if start_date else now - timedelta(days=30)
        ed = datetime.fromisoformat(end_date) if end_date else now
        return sd, ed
    except Exception:
        return now - timedelta(days=30), now


@bp.route('/api/ai/report', methods=['POST', 'GET'])
def ai_report():
    data = request.get_json() or {}
    period = data.get('period', '30d')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    department = data.get('department')

    sd, ed = _parse_period(period, start_date, end_date)

    # aggregate metrics
    q = UserInteraction.query.filter(UserInteraction.timestamp >= sd, UserInteraction.timestamp < ed)
    if department:
        # join users to filter by department
        q = q.join(User, User.id == UserInteraction.user_id).filter(User.department == department)

    interactions = q.all()
    total = len(interactions)
    clicks = sum(1 for i in interactions if i.action_taken and 'click' in i.action_taken.lower())
    creds = sum(1 for i in interactions if i.action_taken and 'credential' in (i.meta or {}).get('event', '').lower())

    # quiz results
    qr_q = QuizResult.query.filter(QuizResult.timestamp >= sd, QuizResult.timestamp < ed)
    if department:
        qr_q = qr_q.join(User, User.id == QuizResult.user_id).filter(User.department == department)
    quiz_rows = qr_q.all()
    avg_score = int(sum((r.score or 0) for r in quiz_rows) / len(quiz_rows)) if quiz_rows else 0

    phishing_click_rate = (clicks / total) if total > 0 else 0

    metrics = {
        'period_start': sd.isoformat(),
        'period_end': ed.isoformat(),
        'total_interactions': total,
        'phishing_clicks': clicks,
        'credential_submissions': creds,
        'avg_quiz_score': avg_score,
        'phishing_click_rate': phishing_click_rate,
        'high_risk_departments': []
    }

    # simple high-risk departments detection
    try:
        depts = db.session.query(User.department, db.func.count(UserInteraction.id)).join(UserInteraction, User.id == UserInteraction.user_id).group_by(User.department).all()
        depts_sorted = sorted(depts, key=lambda x: x[1], reverse=True)
        metrics['high_risk_departments'] = [d[0] for d in depts_sorted[:3] if d[0]]
    except Exception:
        pass

    # generate natural language summary via ai_helpers
    report_text = generate_summary(metrics)

    # cache report
    try:
        ar = AIReport(period_start=sd, period_end=ed, department=department, report_text=report_text, metrics=metrics)
        db.session.add(ar)
        db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({'report_text': report_text, 'metrics': metrics})


@bp.route('/api/ai/test', methods=['GET'])
def ai_test():
    # returns sample outputs so reviewers can run without keys
    sample_metrics = {'phishing_click_rate': 0.12, 'avg_quiz_score': 72, 'high_risk_departments': ['HR']}
    sample_summary = generate_summary(sample_metrics)
    return jsonify({'ok': True, 'sample_summary': sample_summary, 'sample_metrics': sample_metrics})
