import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    print("Attempting to import routes.cyber_health...")
    import routes.cyber_health
    print("Import successful!")
    print(f"Blueprint: {routes.cyber_health.bp}")
except Exception as e:
    print(f"Import FAILED: {e}")
    import traceback
    traceback.print_exc()
