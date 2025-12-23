from app import app
from seed_data import seed_users

if __name__ == '__main__':
    with app.app_context():
        print("Running seed_users()...")
        try:
            seed_users()
            print("✅ Seeding complete.")
        except Exception as e:
            print(f"❌ Error seeding users: {e}")
