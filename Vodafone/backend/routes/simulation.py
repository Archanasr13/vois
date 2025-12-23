from flask import Blueprint, request, jsonify
from models import db, Simulation, UserInteraction, User
import random

bp = Blueprint('simulation', __name__)

@bp.route('/api/simulate_attack', methods=['GET'])
def get_simulation():
    """Get a personalized phishing simulation for the user."""
    user_id = request.args.get('user_id', type=int)
    difficulty = request.args.get('difficulty')  # easy, medium, hard
    
    # Get user if provided
    user = None
    if user_id:
        user = db.session.get(User, user_id)
    
    # Get simulations based on difficulty
    query = Simulation.query
    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    
    simulations = query.all()
    
    if not simulations:
        return jsonify({'error': 'No simulations available'}), 404
    
    # Select a random simulation
    simulation = random.choice(simulations)
    
    # Personalize the email template with user info if available
    email_template = simulation.email_template
    if user:
        email_template = email_template.replace('{user_email}', user.email)
        email_template = email_template.replace('{user_name}', user.name)
    
    return jsonify({
        'id': simulation.id,
        'template': email_template,
        'difficulty': simulation.difficulty,
        'correct_action': simulation.correct_action,
        'is_phishing': simulation.correct_action == 'safe'
    })

@bp.route('/api/simulations', methods=['GET'])
def list_simulations():
    """Return all simulations (or tailored by department via query param)."""
    dept = request.args.get('department')
    sims = Simulation.query.filter_by(difficulty='easy') if not dept else Simulation.query.filter(Simulation.email_template.contains(dept))
    out = []
    for s in sims.limit(50).all():
        out.append({'id': s.id, 'email_template': s.email_template, 'difficulty': s.difficulty, 'correct_action': s.correct_action})
    return jsonify(out)

@bp.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    sim_id = data.get('simulation_id')
    action = data.get('action')

    sim = db.session.get(Simulation, sim_id)
    if not sim:
        return jsonify({'error': 'simulation not found'}), 404

    is_correct = (action == sim.correct_action)
    # record
    try:
        inter = UserInteraction(user_id=user_id, simulation_id=sim_id, action_taken=action, is_correct=is_correct)
        db.session.add(inter)
        if user_id:
            user = db.session.get(User, user_id)
            if user:
                user.score = (user.score or 0) + (10 if is_correct else -5)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'could not record interaction', 'details': str(e)}), 500

    return jsonify({'ok': True, 'is_correct': is_correct, 'correct_action': sim.correct_action})
