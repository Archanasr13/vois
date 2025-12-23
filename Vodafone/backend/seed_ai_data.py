"""Seed script for AI demo data: creates interactions across departments and a small question pool."""
from app import app, db
from models import User, Simulation, UserInteraction, QuizQuestion, UserProfile
import json
from datetime import datetime, timedelta, timezone


def seed():
    with app.app_context():
        # create users if missing
        if not User.query.first():
            users = [
                User(name='Archana S R', email='archana@example.com', password='password', score=40, department='HR'),
                User(name='Bob Finance', email='bob@example.com', password='password', score=60, department='Finance'),
                User(name='Carol IT', email='carol@example.com', password='password', score=80, department='IT')
            ]
            db.session.add_all(users)
            db.session.commit()

        # create interactions across departments
        users = User.query.all()
        now = datetime.now(timezone.utc)
        for u in users:
            for i in range(3):
                meta = {'event': 'clicked_link' if i % 2 == 0 else 'viewed_email', 'role': u.department}
                inter = UserInteraction(user_id=u.id, simulation_id=None, action_taken='click' if i%2==0 else 'safe', is_correct=(i%2!=0), metadata=meta, timestamp=now - timedelta(days=i*2))
                db.session.add(inter)

        # add a few quiz questions if missing
        if not QuizQuestion.query.first():
            pool = [
                ("What is phishing?", ["A security test","A scam via email","A software update","A social event"], 1, "Phishing is a scam via email." , 'phishing'),
                ("Best way to verify a link?", ["Click it","Hover to view URL","Forward it","Ignore it"], 1, "Hover to view URL before clicking.", 'phishing'),
                ("What is 2FA?", ["Two passwords","Two-step verification","Two accounts","Two devices"], 1, "Two-step verification adds security.", 'auth')
            ]
            for idx, (q, opts, correct, expl, cat) in enumerate(pool):
                qq = QuizQuestion(question=q, options=json.dumps(opts), category=cat, correct_option=correct, explanation=expl)
                db.session.add(qq)

        db.session.commit()

if __name__ == '__main__':
    seed()
    print('AI seed data created')
