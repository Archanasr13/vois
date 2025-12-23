"""Phishing simulation endpoints with realistic, randomized content."""
from flask import Blueprint, request, jsonify
from models import db, User, UserInteraction
from utils.phishing_generator import PhishingSimulator

bp = Blueprint('phishing', __name__, url_prefix='/api/phishing')


@bp.route('/simulate', methods=['GET'])
def get_phishing_simulation():
    """Generate a realistic phishing simulation email.
    
    Query params:
    - user_id: (optional) personalize with user info
    - difficulty: 'easy', 'medium', 'hard' (default: random)
    
    Returns:
        {
            "id": simulation_id (random),
            "subject": str,
            "body": str (email template),
            "fake_button_text": str,
            "fake_url": str,
            "difficulty": str,
            "sender": str,
        }
    """
    user_id = request.args.get('user_id', type=int)
    difficulty = request.args.get('difficulty', default='medium')

    # Generate realistic phishing email
    phishing = PhishingSimulator.generate(difficulty=difficulty)

    # Personalize if user provided
    user = None
    if user_id:
        user = db.session.get(User, user_id)
        if user:
            # Replace placeholders with actual user data
            phishing['body'] = phishing['body'].replace('Dear User', f"Dear {user.name.split()[0]}")
            phishing['body'] = phishing['body'].replace('{email}', user.email)

    # Add a unique sim ID for tracking
    import random
    sim_id = random.randint(10000, 99999)

    return jsonify({**phishing, 'id': sim_id})


@bp.route('/click', methods=['POST'])
def track_phishing_click():
    """Track when a user clicks on a phishing link.
    
    Request body:
    {
        "user_id": int,
        "simulation_id": int,
        "clicked": bool,
    }
    
    Returns:
        { "success": bool, "message": str }
    """
    data = request.get_json() or {}
    user_id = data.get('user_id')
    clicked = data.get('clicked', False)

    if not user_id:
        return jsonify({'success': False, 'message': 'user_id required'}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'success': False, 'message': 'user not found'}), 404

    # Record interaction: 'unsafe' if clicked, 'safe' if ignored
    action_taken = 'unsafe' if clicked else 'safe'
    is_correct = not clicked  # Correct action is to NOT click

    try:
        interaction = UserInteraction(user_id=user_id, action_taken=action_taken, is_correct=is_correct)
        db.session.add(interaction)

        # Update user score: +10 for safe action, -5 for click
        if clicked:
            user.score = max(0, (user.score or 0) - 5)
        else:
            user.score = (user.score or 0) + 10

        db.session.commit()
        return jsonify(
            {
                'success': True,
                'message': 'Great! You avoided the phishing attempt!' if is_correct else 'You fell for the phishing email!',
                'new_score': user.score,
            }
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Could not record interaction', 'details': str(e)}), 500
