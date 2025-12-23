"""User risk profile and organization health score endpoints."""
from flask import Blueprint, request, jsonify
from models import db, User
from utils.risk_calculator import calculate_user_risk_profile, calculate_organization_health_score

bp = Blueprint('health', __name__, url_prefix='/api/health')


@bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_risk_profile(user_id):
    """Get cyber risk profile for a specific user.
    
    Returns:
        {
            "risk_level": "Low" | "Medium" | "High",
            "score": float (0-100, higher = worse),
            "phishing_clicks": int,
            "quiz_mistakes": int,
            "failed_simulations": int,
            "color": str (for UI badge),
        }
    """
    profile = calculate_user_risk_profile(user_id)
    if not profile:
        return jsonify({'error': 'user not found'}), 404

    # Add color for UI display
    color_map = {'Low': 'green', 'Medium': 'yellow', 'High': 'red'}
    profile['color'] = color_map.get(profile['risk_level'], 'gray')

    return jsonify(profile)


@bp.route('/organization', methods=['GET'])
def get_organization_score():
    """Get organization-wide cyber health score.
    
    Returns:
        {
            "health_score": float (0-100, higher is better),
            "phishing_avoidance_rate": float,
            "avg_quiz_score": float,
            "simulation_success_rate": float,
            "summary": str,
            "color": str (for UI badge),
        }
    """
    score_data = calculate_organization_health_score()

    # Add color for UI display
    if score_data['health_score'] >= 75:
        color = 'green'
    elif score_data['health_score'] >= 50:
        color = 'yellow'
    else:
        color = 'red'

    score_data['color'] = color

    return jsonify(score_data)
