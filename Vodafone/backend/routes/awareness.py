from flask import Blueprint, request, jsonify
from models import db, Simulation, UserInteraction

bp = Blueprint('awareness', __name__)

@bp.route('/api/awareness/video', methods=['GET'])
def get_awareness_content():
    """Get awareness video/TTS content after simulation."""
    simulation_id = request.args.get('simulation_id', type=int)
    action_taken = request.args.get('action_taken')  # safe or unsafe
    is_correct = request.args.get('is_correct', 'false').lower() == 'true'
    
    sim = db.session.get(Simulation, simulation_id) if simulation_id else None
    
    # Generate personalized awareness content based on the simulation and user action
    if is_correct:
        content = {
            'type': 'success',
            'title': 'Excellent Decision! 🛡️',
            'message': 'You correctly identified this as a potential security threat. Well done!',
            'video_script': f"""Great job! You correctly identified this {sim.difficulty if sim else ''} phishing attempt. 
            The key red flags you spotted were: suspicious sender address, urgent language demanding immediate action, 
            and links to unknown domains. Always remember: when in doubt, don't click. Report suspicious emails to IT security immediately. 
            Your vigilance helps protect the entire organization.""",
            'tips': [
                'Always verify sender email addresses',
                'Hover over links before clicking',
                'Look for spelling and grammar errors',
                'Be suspicious of urgent language',
                'When in doubt, contact IT security'
            ]
        }
    else:
        content = {
            'type': 'warning',
            'title': 'Learning Opportunity ⚠️',
            'message': 'This was a phishing simulation. In real life, this could have compromised your security.',
            'video_script': f"""This was a {sim.difficulty if sim else ''} phishing simulation designed to test your awareness. 
            In a real scenario, clicking that link could have led to: malware installation, credential theft, or data breach. 
            Key indicators you should watch for: suspicious sender domains, urgent language, requests for personal information, 
            and links that don't match the company's official domain. Remember: legitimate companies never ask for passwords via email. 
            Always verify through official channels.""",
            'tips': [
                'Verify sender through official channels',
                'Check the actual URL before clicking',
                'Look for HTTPS in legitimate sites',
                'Never share passwords via email',
                'Report suspicious emails immediately'
            ]
        }
    
    return jsonify(content)



