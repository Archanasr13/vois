from app import app
from models import db, User, UserInteraction, QuizResult
from datetime import datetime

with app.app_context():
    user_count = User.query.count()
    interaction_count = UserInteraction.query.count()
    quiz_count = QuizResult.query.count()
    
    print(f"Users: {user_count}")
    print(f"Interactions: {interaction_count}")
    print(f"Quiz Results: {quiz_count}")
    
    if user_count == 0:
        print("Creating dummy data...")
        # Create dummy users and data if missing
        users = [
            User(username='it_user', email='it@example.com', department='IT', score=50),
            User(username='hr_user', email='hr@example.com', department='HR', score=35),
            User(username='finance_user', email='finance@example.com', department='Finance', score=60)
        ]
        
        for u in users:
            u.set_password('password')
            db.session.add(u)
        db.session.commit()
        
        # Add dummy interactions
        # IT User (Safe)
        db.session.add(UserInteraction(user_id=users[0].id, simulation_id=1, action_taken='safe', timestamp=datetime.now()))
        # HR User (Safe)
        db.session.add(UserInteraction(user_id=users[1].id, simulation_id=1, action_taken='safe', timestamp=datetime.now()))
        # Finance User (Safe)
        db.session.add(UserInteraction(user_id=users[2].id, simulation_id=1, action_taken='safe', timestamp=datetime.now()))
        
        db.session.commit()
        print("Dummy data created.")
