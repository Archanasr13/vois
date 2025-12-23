from flask import Blueprint, request, send_file, jsonify
from io import BytesIO
from datetime import datetime, timezone
from models import db, User, QuizResult, UserInteraction
from utils.risk_calculator import calculate_user_risk_profile

bp = Blueprint('certificate', __name__)


@bp.route('/api/certificate/check', methods=['GET'])
def check_completion():
    """Check if user has completed all modules and is eligible for certificate."""
    user_id = request.args.get('user_id', type=int)
    
    if not user_id:
        return jsonify({'eligible': False, 'message': 'User ID required'}), 400
    
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'eligible': False, 'message': 'User not found'}), 404
    
    # Check completion criteria
    quiz_count = QuizResult.query.filter_by(user_id=user_id).count()
    simulation_count = UserInteraction.query.filter_by(user_id=user_id).count()
    
    # User needs at least 1 quiz and 3 simulations to get certificate
    eligible = quiz_count >= 1 and simulation_count >= 3
    
    return jsonify({
        'eligible': eligible,
        'quiz_count': quiz_count,
        'simulation_count': simulation_count,
        'required_quizzes': 1,
        'required_simulations': 3,
        'message': 'Certificate available!' if eligible else f'Complete {max(0, 1-quiz_count)} more quiz(zes) and {max(0, 3-simulation_count)} more simulation(s)'
    })


@bp.route('/api/certificate', methods=['POST'])
def generate_certificate():
    """Generate a completion certificate as PDF."""
    # Import reportlab lazily
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib import colors
        from reportlab.lib.units import inch
    except Exception:
        return jsonify({'error': 'reportlab not installed on server; certificate generation unavailable'}), 501

    data = request.get_json() or {}
    user_id = data.get('user_id')
    name = data.get('name', 'Participant')
    
    # Verify user exists and get their stats
    user = None
    if user_id:
        user = db.session.get(User, user_id)
        if user:
            name = user.name
    
    # Get user statistics
    quiz_count = QuizResult.query.filter_by(user_id=user_id).count() if user_id else 0
    simulation_count = UserInteraction.query.filter_by(user_id=user_id).count() if user_id else 0
    total_score = user.score if user else 0
    
    date = datetime.now(timezone.utc).strftime('%B %d, %Y')
    
    # Create PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Background color
    p.setFillColor(colors.HexColor('#1e3c72'))
    p.rect(0, 0, width, height, fill=1)
    
    # White content area
    margin = 50
    p.setFillColor(colors.white)
    p.rect(margin, margin, width - 2*margin, height - 2*margin, fill=1)
    
    # Title
    p.setFillColor(colors.HexColor('#1e3c72'))
    p.setFont('Helvetica-Bold', 32)
    p.drawCentredString(width/2, height - 150, 'CERTIFICATE OF COMPLETION')
    
    # Subtitle
    p.setFont('Helvetica', 18)
    p.drawCentredString(width/2, height - 200, 'Cybersecurity Awareness Training')
    
    # Presented to
    p.setFont('Helvetica', 14)
    p.drawCentredString(width/2, height - 250, 'This is to certify that')
    
    # Name
    p.setFont('Helvetica-Bold', 24)
    p.drawCentredString(width/2, height - 300, name.upper())
    
    # Completion text
    p.setFont('Helvetica', 14)
    p.drawCentredString(width/2, height - 350, 'has successfully completed the')
    p.drawCentredString(width/2, height - 375, 'Cyberattack Simulation & Training Platform')
    
    # Statistics
    p.setFont('Helvetica-Bold', 12)
    p.drawCentredString(width/2, height - 420, f'Completed {quiz_count} Quiz(zes) and {simulation_count} Simulation(s)')
    p.drawCentredString(width/2, height - 445, f'Total Awareness Score: {total_score} points')
    
    # Risk profile
    if user_id:
        profile = calculate_user_risk_profile(user_id)
        if profile:
            p.setFont('Helvetica', 11)
            p.drawCentredString(width/2, height - 470, f"Cyber Risk Level: {profile['risk_level']} (Score: {profile['score']:.1f})")
    
    # Date
    p.setFont('Helvetica', 12)
    p.drawCentredString(width/2, height - 500, f'Date: {date}')
    
    # Footer
    p.setFont('Helvetica-Oblique', 10)
    p.setFillColor(colors.grey)
    p.drawCentredString(width/2, 80, 'This certificate verifies completion of cybersecurity awareness training.')
    p.drawCentredString(width/2, 65, 'Keep this certificate for your records.')
    
    p.showPage()
    p.save()
    buffer.seek(0)
    
    filename = f'certificate_{name.replace(" ", "_")}_{datetime.now(timezone.utc).strftime("%Y%m%d")}.pdf'
    return send_file(buffer, download_name=filename, as_attachment=True, mimetype='application/pdf')
