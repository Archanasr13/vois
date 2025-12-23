from app import app, db
from sqlalchemy import text

def add_role_column():
    with app.app_context():
        try:
            # Check if column exists
            with db.engine.connect() as conn:
                result = conn.execute(text("PRAGMA table_info(user)")).fetchall()
                columns = [row[1] for row in result]
                
                if 'role' not in columns:
                    print("Adding 'role' column to user table...")
                    conn.execute(text("ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'user'"))
                    conn.commit()
                    print("✅ Column 'role' added successfully.")
                else:
                    print("ℹ️ Column 'role' already exists.")
                    
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_role_column()
