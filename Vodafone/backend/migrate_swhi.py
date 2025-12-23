"""
Database migration script for SWHI integration
Creates the swhi_analysis table
"""

from app import app, db
from routes.swhi_routes import SWHIAnalysis
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_swhi_tables():
    """Create SWHI tables in the database"""
    with app.app_context():
        try:
            # Create all tables (will only create missing ones)
            db.create_all()
            logger.info("✅ SWHI tables created successfully")
            
            # Check if table exists
            inspector = db.inspect(db.engine)
            if 'swhi_analysis' in inspector.get_table_names():
                logger.info("✅ swhi_analysis table verified")
            else:
                logger.warning("⚠️  swhi_analysis table not found, attempting manual creation")
                
            return True
        except Exception as e:
            logger.error(f"❌ Error creating SWHI tables: {e}")
            return False

if __name__ == '__main__':
    print("="*60)
    print("SWHI Database Migration")
    print("="*60)
    
    success = migrate_swhi_tables()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("\nSWHI is ready to use.")
        print("Start the backend server with: python app.py")
    else:
        print("\n❌ Migration failed. Check the logs above.")
        print("The application may still work, but SWHI history won't be saved.")
