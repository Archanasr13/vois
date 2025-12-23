"""
Collect initial training data by analyzing known safe and malicious domains
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import analyzer
from ml.data_collector import TrainingDataCollector

def collect_safe_domains():
    """Analyze known safe domains"""
    safe_domains = [
        'google.com', 'facebook.com', 'amazon.com', 'microsoft.com',
        'apple.com', 'github.com', 'stackoverflow.com', 'wikipedia.org',
        'youtube.com', 'twitter.com', 'linkedin.com', 'reddit.com',
        'netflix.com', 'instagram.com', 'adobe.com', 'oracle.com',
        'ibm.com', 'cisco.com', 'intel.com', 'nvidia.com'
    ]
    
    collector = TrainingDataCollector()
    
    print("Collecting SAFE domain samples...")
    print("=" * 60)
    
    for domain in safe_domains:
        try:
            print(f"Analyzing {domain}...")
            analysis = analyzer.analyze_domain(domain)
            if 'error' not in analysis:
                collector.add_sample(analysis, label=0, notes='Known safe domain')
                print(f"✅ Added {domain} as SAFE")
            else:
                print(f"❌ Error analyzing {domain}: {analysis.get('error')}")
        except Exception as e:
            print(f"❌ Exception analyzing {domain}: {e}")
    
    print(f"\n✅ Collected {len(safe_domains)} safe domain samples")

def collect_suspicious_domains():
    """Analyze suspicious domains (you should replace these with real examples)"""
    # NOTE: These are example patterns - replace with real suspicious domains
    # from threat intelligence feeds
    suspicious_patterns = [
        # Add real suspicious domains here
        # Example: 'suspicious-login-verify.tk'
    ]
    
    if not suspicious_patterns:
        print("\n⚠️  No suspicious domains configured")
        print("Add real suspicious domains to this list from threat feeds")
        return
    
    collector = TrainingDataCollector()
    
    print("\nCollecting SUSPICIOUS domain samples...")
    print("=" * 60)
    
    for domain in suspicious_patterns:
        try:
            print(f"Analyzing {domain}...")
            analysis = analyzer.analyze_domain(domain)
            if 'error' not in analysis:
                collector.add_sample(analysis, label=1, notes='Suspicious pattern')
                print(f"✅ Added {domain} as SUSPICIOUS")
            else:
                print(f"❌ Error analyzing {domain}")
        except Exception as e:
            print(f"❌ Exception analyzing {domain}: {e}")

def collect_malicious_domains():
    """Analyze known malicious domains"""
    # NOTE: Add real malicious domains from threat feeds
    # Sources: URLhaus, PhishTank, etc.
    malicious_domains = [
        # Add real malicious domains here
        # Example: 'known-phishing-site.xyz'
    ]
    
    if not malicious_domains:
        print("\n⚠️  No malicious domains configured")
        print("Add real malicious domains from threat intelligence feeds:")
        print("  - URLhaus: https://urlhaus.abuse.ch/")
        print("  - PhishTank: https://www.phishtank.com/")
        print("  - OpenPhish: https://openphish.com/")
        return
    
    collector = TrainingDataCollector()
    
    print("\nCollecting MALICIOUS domain samples...")
    print("=" * 60)
    
    for domain in malicious_domains:
        try:
            print(f"Analyzing {domain}...")
            analysis = analyzer.analyze_domain(domain)
            if 'error' not in analysis:
                collector.add_sample(analysis, label=2, notes='Known malicious')
                print(f"✅ Added {domain} as MALICIOUS")
            else:
                print(f"❌ Error analyzing {domain}")
        except Exception as e:
            print(f"❌ Exception analyzing {domain}: {e}")

def main():
    print("=" * 60)
    print("Training Data Collection")
    print("=" * 60)
    print("\nThis script will analyze domains and collect training data")
    print("for the ML model.\n")
    
    # Collect safe domains
    collect_safe_domains()
    
    # Collect suspicious domains
    collect_suspicious_domains()
    
    # Collect malicious domains
    collect_malicious_domains()
    
    # Show summary
    collector = TrainingDataCollector()
    summary = collector.export_summary()
    
    print("\n" + "=" * 60)
    print("✅ Data Collection Complete!")
    print("=" * 60)
    print(f"\nTotal samples: {summary['total_samples']}")
    print(f"Label distribution: {summary['label_distribution']}")
    print(f"\nData saved to: ml/training_data.json")
    print("\nNext steps:")
    print("1. Add more suspicious/malicious domains from threat feeds")
    print("2. Run: python train_model.py")
    print("3. The trained model will be saved to ml/threat_model.pkl")

if __name__ == '__main__':
    main()
