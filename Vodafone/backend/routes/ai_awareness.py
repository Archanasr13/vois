from flask import Blueprint, request, jsonify
from models import db, User, UserInteraction
from utils.ai_helpers import generate_awareness_script, generate_tts
from datetime import datetime

bp = Blueprint('ai_awareness', __name__)


@bp.route('/api/ai/awareness', methods=['POST'])
def ai_awareness():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    interaction_id = data.get('interaction_id')
    simulation_type = data.get('simulation_type')
    difficulty = data.get('difficulty')

    user = User.query.get(user_id) if user_id else None
    interaction = UserInteraction.query.get(interaction_id) if interaction_id else None

    user_name = user.name if user else 'User'
    department = user.department if user else 'General'

    context = {
        'user_name': user_name,
        'action': (interaction.action_taken if interaction else 'an unsafe action'),
        'simulation_type': simulation_type or 'a phishing email',
        'department': department,
        'interaction_meta': (interaction.meta if interaction else {}),
        'tips': ['Verify sender addresses', 'Hover links before clicking', 'Report suspicious messages to IT']
    }

    script_text = generate_awareness_script(context)

    # Try to generate pseudo-audio (TXT placeholder) and return URL if successful
    audio_url = generate_tts(script_text, user_id=user_id)

    return jsonify({'script_text': script_text, 'audio_url': audio_url, 'suggested_lottie_animation': 'security_alert.json'})
