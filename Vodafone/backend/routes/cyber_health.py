"""AI-Generated Cyber Health Score and Insights"""
from flask import Blueprint, jsonify, send_file
from models import db, User, UserInteraction, QuizResult
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
import random
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

bp = Blueprint('cyber_health', __name__, url_prefix='/api/cyber-health')

def _get_health_data():
    """Helper function to calculate all health metrics"""
    # Calculate overall metrics
    total_users = User.query.count()
    total_interactions = UserInteraction.query.count()
    
    # Safe vs Unsafe actions
    safe_actions = UserInteraction.query.filter_by(action_taken='safe').count()
    unsafe_actions = UserInteraction.query.filter_by(action_taken='unsafe').count()
    
    # Calculate click rate (percentage of unsafe actions)
    click_rate = (unsafe_actions / total_interactions * 100) if total_interactions > 0 else 0
    
    # Quiz performance
    quiz_results = QuizResult.query.all()
    avg_quiz_score = sum(q.score for q in quiz_results) / len(quiz_results) if quiz_results else 0
    
    # Department analysis
    departments = {}
    users = User.query.all()
    for user in users:
        dept = user.department or 'General'
        if dept not in departments:
            departments[dept] = {
                'users': 0,
                'safe_actions': 0,
                'unsafe_actions': 0,
                'avg_score': 0,
                'scores': []
            }
        
        departments[dept]['users'] += 1
        departments[dept]['scores'].append(user.score or 0)
        
        # Get user's interactions
        user_interactions = UserInteraction.query.filter_by(user_id=user.id).all()
        for interaction in user_interactions:
            if interaction.action_taken == 'safe':
                departments[dept]['safe_actions'] += 1
            else:
                departments[dept]['unsafe_actions'] += 1
    
    # Calculate department averages
    dept_performance = []
    for dept, data in departments.items():
        total_dept_actions = data['safe_actions'] + data['unsafe_actions']
        dept_click_rate = (data['unsafe_actions'] / total_dept_actions * 100) if total_dept_actions > 0 else 0
        avg_score = sum(data['scores']) / len(data['scores']) if data['scores'] else 0
        
        dept_performance.append({
            'name': dept,
            'users': data['users'],
            'click_rate': round(dept_click_rate, 1),
            'avg_score': round(avg_score, 1),
            'safe_actions': data['safe_actions'],
            'unsafe_actions': data['unsafe_actions']
        })
    
    # Sort departments by performance (lower click rate = better)
    dept_performance.sort(key=lambda x: x['click_rate'])
    
    # Calculate overall health score (0-100)
    # Factors: low click rate (40%), high quiz scores (30%), high engagement (30%)
    click_rate_score = max(0, 100 - click_rate * 2)  # Lower click rate = higher score
    quiz_score_component = avg_quiz_score * 0.3
    engagement_score = min(100, (total_interactions / total_users * 10)) if total_users > 0 else 0
    
    health_score = round((click_rate_score * 0.4) + (quiz_score_component) + (engagement_score * 0.3))
    health_score = min(100, max(0, health_score))
    
    # Generate AI insights (natural language)
    insights = generate_insights(
        click_rate, 
        dept_performance, 
        avg_quiz_score, 
        total_interactions,
        health_score
    )
    
    # Generate recommendations
    recommendations = generate_recommendations(dept_performance, click_rate, avg_quiz_score)
    
    # Trend data (simulated for now - in production, compare with previous periods)
    trend = {
        'click_rate_change': round(random.uniform(-40, -10), 1),  # Simulated improvement
        'quiz_score_change': round(random.uniform(5, 20), 1),
        'engagement_change': round(random.uniform(10, 30), 1)
    }
    
    return {
        'health_score': health_score,
        'metrics': {
            'total_users': total_users,
            'total_interactions': total_interactions,
            'click_rate': round(click_rate, 1),
            'avg_quiz_score': round(avg_quiz_score, 1),
            'safe_actions': safe_actions,
            'unsafe_actions': unsafe_actions
        },
        'insights': insights,
        'recommendations': recommendations,
        'departments': dept_performance,
        'trends': trend,
        'generated_at': datetime.now(timezone.utc).isoformat()
    }

@bp.route('/report', methods=['GET'])
def get_cyber_health_report():
    """
    Generate AI-powered cyber health report with natural language insights.
    Returns overall health score, trends, department analysis, and recommendations.
    """
    data = _get_health_data()
    return jsonify(data)

@bp.route('/export-report', methods=['GET'])
def export_report():
    """Generate and download PDF report"""
    data = _get_health_data()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center
    )
    story.append(Paragraph("Cyber Health Leadership Report", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 20))

    # Overall Score
    story.append(Paragraph(f"Overall Cyber Health Score: {data['health_score']}/100", styles['Heading2']))
    story.append(Spacer(1, 10))

    # Metrics Table
    metrics_data = [
        ['Metric', 'Value'],
        ['Total Users', str(data['metrics']['total_users'])],
        ['Phishing Click Rate', f"{data['metrics']['click_rate']}%"],
        ['Avg Quiz Score', f"{data['metrics']['avg_quiz_score']}%"],
        ['Safe Actions', str(data['metrics']['safe_actions'])],
        ['Unsafe Actions', str(data['metrics']['unsafe_actions'])]
    ]
    t = Table(metrics_data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(t)
    story.append(Spacer(1, 20))

    # Insights
    story.append(Paragraph("AI Insights", styles['Heading2']))
    for insight in data['insights']:
        story.append(Paragraph(f"• {insight}", styles['Normal']))
        story.append(Spacer(1, 5))
    story.append(Spacer(1, 20))

    # Recommendations
    story.append(Paragraph("Key Recommendations", styles['Heading2']))
    for rec in data['recommendations']:
        story.append(Paragraph(f"<b>{rec['title']}</b> ({rec['priority'].upper()})", styles['Normal']))
        story.append(Paragraph(rec['description'], styles['Normal']))
        story.append(Spacer(1, 10))

    doc.build(story)
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'cyber_health_report_{datetime.now().strftime("%Y%m%d")}.pdf',
        mimetype='application/pdf'
    )

def generate_insights(click_rate, dept_performance, avg_quiz_score, total_interactions, health_score):
    """Generate natural language insights from data"""
    insights = []
    
    # Overall health insight
    if health_score >= 80:
        insights.append(f"🎉 Excellent! Your organization's cyber health score is {health_score}/100, indicating strong security awareness across the board.")
    elif health_score >= 60:
        insights.append(f"👍 Good progress! Your cyber health score is {health_score}/100. There's room for improvement in some areas.")
    else:
        insights.append(f"⚠️ Attention needed! Your cyber health score is {health_score}/100. Immediate action is recommended to strengthen security awareness.")
    
    # Click rate insight
    if click_rate < 20:
        insights.append(f"📉 Phishing click rates are low at {click_rate:.1f}%, showing strong vigilance among employees.")
    elif click_rate < 40:
        insights.append(f"📊 Phishing click rates are moderate at {click_rate:.1f}%. Continued training will help reduce this further.")
    else:
        insights.append(f"🚨 Phishing click rates are high at {click_rate:.1f}%. Urgent awareness training is needed to reduce vulnerability.")
    
    # Department insights
    if len(dept_performance) >= 2:
        best_dept = dept_performance[0]
        worst_dept = dept_performance[-1]
        
        if best_dept['click_rate'] < 20:
            insights.append(f"🏆 The {best_dept['name']} department is leading with only {best_dept['click_rate']:.1f}% click rate. Their practices can serve as a model for other teams.")
        
        if worst_dept['click_rate'] > 30:
            insights.append(f"📚 The {worst_dept['name']} department needs focused training, with a {worst_dept['click_rate']:.1f}% click rate. Consider targeted awareness videos and workshops.")
    
    # Quiz performance insight
    if avg_quiz_score >= 80:
        insights.append(f"✅ Quiz performance is excellent at {avg_quiz_score:.1f}%, indicating strong theoretical knowledge of security practices.")
    elif avg_quiz_score >= 60:
        insights.append(f"📖 Quiz scores average {avg_quiz_score:.1f}%. Additional training materials could help improve knowledge retention.")
    else:
        insights.append(f"📕 Quiz scores are below target at {avg_quiz_score:.1f}%. Consider more interactive training sessions to improve understanding.")
    
    # Engagement insight
    if total_interactions > 50:
        insights.append(f"💪 High engagement detected with {total_interactions} total interactions. Employees are actively participating in security training.")
    
    return insights


def generate_recommendations(dept_performance, click_rate, avg_quiz_score):
    """Generate actionable recommendations"""
    recommendations = []
    
    # Department-specific recommendations
    if len(dept_performance) >= 1:
        worst_dept = dept_performance[-1]
        if worst_dept['click_rate'] > 30:
            recommendations.append({
                'priority': 'high',
                'title': f'Targeted Training for {worst_dept["name"]}',
                'description': f'Deploy focused phishing awareness campaigns and mandatory training sessions for the {worst_dept["name"]} department.',
                'action': 'Schedule training session'
            })
    
    # Click rate recommendations
    if click_rate > 30:
        recommendations.append({
            'priority': 'high',
            'title': 'Increase Phishing Simulation Frequency',
            'description': 'Run weekly phishing simulations to build muscle memory and improve threat recognition.',
            'action': 'Configure simulations'
        })
    
    # Quiz score recommendations
    if avg_quiz_score < 70:
        recommendations.append({
            'priority': 'medium',
            'title': 'Enhance Training Materials',
            'description': 'Update training content with more interactive elements, real-world examples, and video demonstrations.',
            'action': 'Review content library'
        })
    
    # Best practice recommendations
    recommendations.append({
        'priority': 'low',
        'title': 'Share Success Stories',
        'description': 'Highlight employees and departments with excellent security awareness to encourage organization-wide improvement.',
        'action': 'Create recognition program'
    })
    
    recommendations.append({
        'priority': 'medium',
        'title': 'Monthly Security Briefings',
        'description': 'Conduct monthly briefings to discuss emerging threats, recent incidents, and updated security policies.',
        'action': 'Schedule briefings'
    })
    
    return recommendations
