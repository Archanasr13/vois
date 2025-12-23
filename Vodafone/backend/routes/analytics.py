from flask import Blueprint, jsonify
from datetime import datetime, timedelta, timezone
from models import db, UserInteraction, QuizResult
from sqlalchemy import func

bp = Blueprint('analytics', __name__)


@bp.route('/api/analytics/behavior', methods=['GET'])
def behavior_metrics():
    try:
        total_clicks = UserInteraction.query.count()
        correct = UserInteraction.query.filter_by(is_correct=True).count()
        unsafe = UserInteraction.query.filter_by(is_correct=False).count()

        # placeholder for average detection time
        avg_time_to_detect = 12

        # Build a simple 4-week trend using QuizResult averages (same logic as dashboard)
        now = datetime.now(timezone.utc)
        weekly_scores = []
        for w in range(3, -1, -1):
            start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(weeks=w)
            end = start + timedelta(days=7)
            rows = QuizResult.query.filter(QuizResult.timestamp >= start, QuizResult.timestamp < end).all()
            if rows:
                avg_w = int(sum(r.score for r in rows) / len(rows))
            else:
                avg_w = 0
            weekly_scores.append(avg_w)

        # simple improvement trend (use weekly_scores or fallback)
        if any(weekly_scores):
            trend = weekly_scores
        else:
            trend = [50, 55, 60, 65]

        return jsonify({
            'total_clicks': total_clicks,
            'correct': correct,
            'unsafe': unsafe,
            'avg_time_to_detect': avg_time_to_detect,
            'improvement_trend': trend
        })
    except Exception as e:
        return jsonify({'error': 'db error', 'details': str(e)}), 500
