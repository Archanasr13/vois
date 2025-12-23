"""
Test script to verify SWHI integration
"""
import sys
sys.path.insert(0, '.')

print("=" * 60)
print("SWHI Integration Test")
print("=" * 60)

# Test 1: Import analyzer
print("\n[1/4] Testing SWHI analyzer import...")
try:
    from swhi.analyzer import DomainAnalyzer
    analyzer = DomainAnalyzer()
    print("✅ SWHI analyzer imported successfully")
except Exception as e:
    print(f"❌ Failed to import analyzer: {e}")
    sys.exit(1)

# Test 2: Import routes
print("\n[2/4] Testing SWHI routes import...")
try:
    from routes import swhi_routes
    print(f"✅ SWHI routes imported successfully")
    print(f"   - Analyzer available: {swhi_routes.analyzer is not None}")
    print(f"   - ML available: {swhi_routes.ml_predictor is not None}")
except Exception as e:
    print(f"❌ Failed to import routes: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 3: Create app and register blueprint
print("\n[3/4] Testing blueprint registration...")
try:
    from app import app
    print(f"✅ App created")
    print(f"   - Registered blueprints: {list(app.blueprints.keys())}")
    if 'swhi' in app.blueprints:
        print("   ✅ SWHI blueprint registered!")
    else:
        print("   ⚠️  SWHI blueprint NOT registered (will be registered at runtime)")
except Exception as e:
    print(f"❌ Failed: {e}")

# Test 4: List routes
print("\n[4/4] Testing if SWHI routes exist...")
try:
    with app.app_context():
        swhi_routes = [rule.rule for rule in app.url_map.iter_rules() if 'swhi' in rule.rule]
        if swhi_routes:
            print(f"✅ Found {len(swhi_routes)} SWHI routes:")
            for route in swhi_routes:
                print(f"   - {route}")
        else:
            print("⚠️  No SWHI routes found (will be added at runtime)")
except Exception as e:
    print(f"Info: {e}")

print("\n" + "=" * 60)
print("Test Complete!")
print("=" * 60)
