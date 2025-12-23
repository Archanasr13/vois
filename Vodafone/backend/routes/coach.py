from flask import Blueprint, request, jsonify

bp = Blueprint('coach', __name__)

@bp.route('/api/coach', methods=['POST'])
def coach():
    data = request.get_json() or {}
    # For now return mocked advice based on provided event
    event = data.get('event', {})
    # Sample heuristics
    if event.get('type') == 'simulation' and event.get('clicked_link'):
        domain = event.get('domain', '')
        advice = f"You clicked the link from {domain}. Check the domain carefully in the future and avoid clicking unknown links. Look for misspellings and unexpected subdomains."
    elif event.get('type') == 'quiz' and event.get('wrong_reason'):
        advice = f"You missed that question because: {event.get('wrong_reason')}. Review the explanation in the training module and try a similar quiz."
    else:
        advice = "Good job — keep practicing. The AI coach will give targeted tips after more interactions."
    return jsonify({'advice': advice})
