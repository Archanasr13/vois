from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

# Centralized SQLAlchemy instance used across the app
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    department = db.Column(db.String(64), nullable=True)
    password = db.Column(db.String(128), nullable=False)
    score = db.Column(db.Integer, default=0)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Simulation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email_template = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(32), nullable=True)
    correct_action = db.Column(db.String(64), nullable=False, default='safe')
    department = db.Column(db.String(64), nullable=True)
    success_rate = db.Column(db.Float, nullable=True)


class UserInteraction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    simulation_id = db.Column(db.Integer, db.ForeignKey('simulation.id'), nullable=True)
    action_taken = db.Column(db.String(64), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # free-form metadata to store context about the interaction (clicked_link, role, reaction_time, etc.)
    meta = db.Column('meta', db.JSON, nullable=True)


class QuizResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    score = db.Column(db.Integer)
    total_questions = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class QuizQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text, nullable=False)  # stored as JSON
    category = db.Column(db.String(64), nullable=False, default='general')
    correct_option = db.Column(db.Integer, nullable=False)
    explanation = db.Column(db.Text, nullable=True)


class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    last_active = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # list of topics where user is weak, e.g. {"phishing": 0.8}
    weak_topics = db.Column(db.JSON, nullable=True)
    consented = db.Column(db.Boolean, default=True)


class AIReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    period_start = db.Column(db.DateTime, nullable=True)
    period_end = db.Column(db.DateTime, nullable=True)
    department = db.Column(db.String(64), nullable=True)
    report_text = db.Column(db.Text, nullable=False)
    metrics = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
