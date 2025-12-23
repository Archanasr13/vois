from app import app, db
from models import User
from werkzeug.security import generate_password_hash

def create_lisa_admin():
    with app.app_context():
        email = 'lisa.davis@company.com'
        user = User.query.filter_by(email=email).first()
        
        if user:
            print(f"User {email} already exists. Updating to admin...")
            user.role = 'admin'
            user.password = generate_password_hash('password123')
            db.session.commit()
            print(f"✅ User {email} updated to Admin role with new password.")
        else:
            print(f"Creating new Admin user: {email}...")
            new_user = User(
                name='Lisa Davis',
                email=email,
                department='IT Security',
                role='admin',
                password=generate_password_hash('password123'),
                score=100
            )
            db.session.add(new_user)
            db.session.commit()
            print(f"✅ Admin user {email} created successfully.")

if __name__ == '__main__':
    try:
        create_lisa_admin()
    except Exception as e:
        print(f"❌ Error: {e}")
