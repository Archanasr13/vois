"""Calculate risk profiles and health scores for users and organization."""
from models import db, User, UserInteraction, QuizResult
from sqlalchemy import func


def calculate_user_risk_profile(user_id):
    """Calculate a user's cyber risk level (Low/Medium/High).

    Based on:
    - Phishing clicks (% of clicks vs. total interactions)
    - Quiz mistakes (% wrong answers)
    - Failed simulations (% failed vs. total simulations)

    Returns:
        {
            "risk_level": "Low" | "Medium" | "High",
            "score": float (0-100, higher = worse),
            "phishing_clicks": int,
            "quiz_mistakes": int,
            "failed_simulations": int,
        }
    """
    user = db.session.get(User, user_id)
    if not user:
        return None

    # Count phishing clicks (action_taken == 'unsafe')
    phishing_clicks = UserInteraction.query.filter_by(user_id=user_id, action_taken="unsafe").count()
    total_interactions = UserInteraction.query.filter_by(user_id=user_id).count()
    phishing_click_rate = (phishing_clicks / total_interactions * 100) if total_interactions > 0 else 0

    # Count quiz mistakes
    quiz_results = QuizResult.query.filter_by(user_id=user_id).all()
    total_questions_answered = sum(r.total_questions for r in quiz_results)
    correct_answers = sum(r.score // 100 * r.total_questions for r in quiz_results)  # Approximate
    quiz_mistake_rate = (
        ((total_questions_answered - correct_answers) / total_questions_answered * 100)
        if total_questions_answered > 0
        else 0
    )

    # Count failed simulations (is_correct == False)
    failed_simulations = UserInteraction.query.filter_by(user_id=user_id, is_correct=False).count()
    total_simulations = UserInteraction.query.filter_by(user_id=user_id).count()
    failed_sim_rate = (failed_simulations / total_simulations * 100) if total_simulations > 0 else 0

    # Compute overall risk score (0-100, higher is worse)
    risk_score = (phishing_click_rate * 0.4 + quiz_mistake_rate * 0.3 + failed_sim_rate * 0.3)

    # Classify risk level
    if risk_score < 25:
        risk_level = "Low"
    elif risk_score < 60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "risk_level": risk_level,
        "score": round(risk_score, 2),
        "phishing_clicks": phishing_clicks,
        "quiz_mistakes": int(
            total_questions_answered - correct_answers if total_questions_answered > 0 else 0
        ),
        "failed_simulations": failed_simulations,
    }


def calculate_organization_health_score():
    """Calculate organization-wide cyber health score (0-100, higher is better).

    Based on:
    - Phishing click avoidance rate (% safe actions)
    - Average quiz performance (average score across all users)
    - Simulation success rate

    Returns:
        {
            "health_score": float (0-100),
            "phishing_avoidance_rate": float,
            "avg_quiz_score": float,
            "simulation_success_rate": float,
            "summary": str,
        }
    """
    # Phishing avoidance
    total_interactions = UserInteraction.query.count()
    safe_actions = UserInteraction.query.filter_by(action_taken="safe").count()
    phishing_avoidance = (safe_actions / total_interactions * 100) if total_interactions > 0 else 0

    # Quiz performance
    avg_quiz_score_row = db.session.query(func.avg(QuizResult.score)).one()
    avg_quiz_score = float(avg_quiz_score_row[0]) if avg_quiz_score_row[0] else 0

    # Simulation success
    correct_simulations = UserInteraction.query.filter_by(is_correct=True).count()
    sim_success_rate = (correct_simulations / total_interactions * 100) if total_interactions > 0 else 0

    # Overall score (weighted average, higher is better)
    health_score = (phishing_avoidance * 0.4 + avg_quiz_score * 0.35 + sim_success_rate * 0.25)

    # Generate summary
    if health_score >= 75:
        summary = "Excellent! Your organization has strong security awareness."
    elif health_score >= 50:
        summary = "Good performance. Continue training to improve security awareness."
    else:
        summary = "Training needed. Increase phishing awareness and quiz performance."

    return {
        "health_score": round(health_score, 2),
        "phishing_avoidance_rate": round(phishing_avoidance, 2),
        "avg_quiz_score": round(avg_quiz_score, 2),
        "simulation_success_rate": round(sim_success_rate, 2),
        "summary": summary,
    }
