"""
Quick training data collection - Creates initial dataset with minimal samples
This is faster than full analysis
"""

import json
import os

def create_quick_training_data():
    """Create a minimal training dataset to get started quickly"""
    
    # Minimal training data with just enough to train
    training_data = {
        'analyses': [],
        'labels': [],
        'metadata': []
    }
    
    # Safe domains - simplified analysis
    safe_samples = [
        {
            'domain': 'google.com',
            'dns_records': {'A': ['142.250.185.46'], 'MX': ['smtp.google.com'], 'NS': ['ns1.google.com']},
            'ssl_info': {'valid': True, 'not_after': 'Dec 31 23:59:59 2025 GMT', 'issuer': {'CN': 'Google Trust Services'}},
            'ip_info': {'ip': '142.250.185.46', 'geolocation': {'country': 'United States', 'country_code': 'US'}, 'asn': {'asn': 'AS15169', 'org': 'Google LLC'}, 'is_private': False},
            'cdn_detection': {'detected': False},
            'whois_info': {'creation_date': '1997-09-15T00:00:00', 'registrar': 'MarkMonitor Inc.'},
            'subdomains': ['mail.google.com', 'www.google.com', 'drive.google.com'],
            'suspicious_score': 5.0
        },
        {
            'domain': 'amazon.com',
            'dns_records': {'A': ['205.251.242.103'], 'MX': ['amazon-smtp.amazon.com'], 'NS': ['ns1.amazon.com']},
            'ssl_info': {'valid': True, 'not_after': 'Dec 31 23:59:59 2025 GMT', 'issuer': {'CN': 'Amazon'}},
            'ip_info': {'ip': '205.251.242.103', 'geolocation': {'country': 'United States', 'country_code': 'US'}, 'asn': {'asn': 'AS16509', 'org': 'Amazon.com, Inc.'}, 'is_private': False},
            'cdn_detection': {'detected': True, 'provider': 'amazon'},
            'whois_info': {'creation_date': '1994-11-01T00:00:00', 'registrar': 'MarkMonitor Inc.'},
            'subdomains': ['www.amazon.com', 'aws.amazon.com'],
            'suspicious_score': 10.0
        },
        {
            'domain': 'microsoft.com',
            'dns_records': {'A': ['20.112.52.29'], 'MX': ['microsoft-com.mail.protection.outlook.com'], 'NS': ['ns1.msft.net']},
            'ssl_info': {'valid': True, 'not_after': 'Dec 31 23:59:59 2025 GMT', 'issuer': {'CN': 'Microsoft'}},
            'ip_info': {'ip': '20.112.52.29', 'geolocation': {'country': 'United States', 'country_code': 'US'}, 'asn': {'asn': 'AS8075', 'org': 'Microsoft Corporation'}, 'is_private': False},
            'cdn_detection': {'detected': False},
            'whois_info': {'creation_date': '1991-05-02T00:00:00', 'registrar': 'MarkMonitor Inc.'},
            'subdomains': ['www.microsoft.com', 'azure.microsoft.com'],
            'suspicious_score': 5.0
        },
        {
            'domain': 'github.com',
            'dns_records': {'A': ['140.82.121.4'], 'MX': [], 'NS': ['ns1.github.com']},
            'ssl_info': {'valid': True, 'not_after': 'Dec 31 23:59:59 2025 GMT', 'issuer': {'CN': 'DigiCert'}},
            'ip_info': {'ip': '140.82.121.4', 'geolocation': {'country': 'United States', 'country_code': 'US'}, 'asn': {'asn': 'AS36459', 'org': 'GitHub, Inc.'}, 'is_private': False},
            'cdn_detection': {'detected': False},
            'whois_info': {'creation_date': '2007-10-09T00:00:00', 'registrar': 'MarkMonitor Inc.'},
            'subdomains': ['gist.github.com', 'api.github.com'],
            'suspicious_score': 8.0
        },
        {
            'domain': 'stackoverflow.com',
            'dns_records': {'A': ['151.101.1.69'], 'MX': [], 'NS': ['ns1.stackexchange.com']},
            'ssl_info': {'valid': True, 'not_after': 'Dec 31 23:59:59 2025 GMT', 'issuer': {'CN': 'DigiCert'}},
            'ip_info': {'ip': '151.101.1.69', 'geolocation': {'country': 'United States', 'country_code': 'US'}, 'asn': {'asn': 'AS54113', 'org': 'Fastly'}, 'is_private': False},
            'cdn_detection': {'detected': True, 'provider': 'fastly'},
            'whois_info': {'creation_date': '2003-12-26T00:00:00', 'registrar': 'MarkMonitor Inc.'},
            'subdomains': ['meta.stackoverflow.com'],
            'suspicious_score': 12.0
        }
    ]
    
    # Suspicious/Malicious samples - simulated patterns
    malicious_samples = [
        {
            'domain': 'secure-login-verify.tk',
            'dns_records': {'A': ['185.220.101.1'], 'MX': [], 'NS': ['ns1.freenom.com']},
            'ssl_info': {'valid': True, 'not_after': 'Jan 15 23:59:59 2025 GMT', 'issuer': {'CN': "Let's Encrypt"}},
            'ip_info': {'ip': '185.220.101.1', 'geolocation': {'country': 'Russia', 'country_code': 'RU'}, 'asn': {'asn': 'AS12345', 'org': 'Unknown Hosting'}, 'is_private': False},
            'cdn_detection': {'detected': False},
            'whois_info': {'creation_date': '2024-11-01T00:00:00', 'registrar': 'Freenom', 'has_privacy_protection': True},
            'subdomains': [],
            'suspicious_score': 85.0
        },
        {
            'domain': 'paypal-verify-account.ml',
            'dns_records': {'A': ['45.142.212.61'], 'MX': [], 'NS': ['ns1.freenom.com']},
            'ssl_info': {'valid': True, 'not_after': 'Feb 01 23:59:59 2025 GMT', 'issuer': {'CN': "Let's Encrypt"}},
            'ip_info': {'ip': '45.142.212.61', 'geolocation': {'country': 'Netherlands', 'country_code': 'NL'}, 'asn': {'asn': 'AS54321', 'org': 'Cheap Hosting'}, 'is_private': False},
            'cdn_detection': {'detected': False},
            'whois_info': {'creation_date': '2024-10-28T00:00:00', 'registrar': 'Freenom', 'has_privacy_protection': True},
            'subdomains': [],
            'suspicious_score': 90.0
        },
        {
            'domain': 'amazon-security-update.ga',
            'dns_records': {'A': ['104.21.45.123'], 'MX': [], 'NS': ['ns1.freenom.com']},
            'ssl_info': {'valid': True, 'not_after': 'Jan 20 23:59:59 2025 GMT', 'issuer': {'CN': "Let's Encrypt"}},
            'ip_info': {'ip': '104.21.45.123', 'geolocation': {'country': 'United States', 'country_code': 'US'}, 'asn': {'asn': 'AS13335', 'org': 'Cloudflare'}, 'is_private': False},
            'cdn_detection': {'detected': True, 'provider': 'cloudflare'},
            'whois_info': {'creation_date': '2024-11-15T00:00:00', 'registrar': 'Freenom', 'has_privacy_protection': True},
            'subdomains': [],
            'suspicious_score': 88.0
        },
        {
            'domain': 'microsoft-account-locked.xyz',
            'dns_records': {'A': ['192.3.165.30'], 'MX': [], 'NS': ['ns1.namecheap.com']},
            'ssl_info': {'valid': True, 'not_after': 'Feb 10 23:59:59 2025 GMT', 'issuer': {'CN': "Let's Encrypt"}},
            'ip_info': {'ip': '192.3.165.30', 'geolocation': {'country': 'United States', 'country_code': 'US'}, 'asn': {'asn': 'AS22612', 'org': 'Namecheap'}, 'is_private': False},
            'cdn_detection': {'detected': False},
            'whois_info': {'creation_date': '2024-11-20T00:00:00', 'registrar': 'Namecheap', 'has_privacy_protection': True},
            'subdomains': [],
            'suspicious_score': 92.0
        },
        {
            'domain': 'banking-verify-now.top',
            'dns_records': {'A': ['172.67.150.45'], 'MX': [], 'NS': ['ns1.cloudflare.com']},
            'ssl_info': {'valid': True, 'not_after': 'Jan 25 23:59:59 2025 GMT', 'issuer': {'CN': "Let's Encrypt"}},
            'ip_info': {'ip': '172.67.150.45', 'geolocation': {'country': 'United States', 'country_code': 'US'}, 'asn': {'asn': 'AS13335', 'org': 'Cloudflare'}, 'is_private': False},
            'cdn_detection': {'detected': True, 'provider': 'cloudflare'},
            'whois_info': {'creation_date': '2024-11-10T00:00:00', 'registrar': 'Namecheap', 'has_privacy_protection': True},
            'subdomains': [],
            'suspicious_score': 95.0
        }
    ]
    
    # Add safe samples (label 0)
    for sample in safe_samples:
        training_data['analyses'].append(sample)
        training_data['labels'].append(0)
        training_data['metadata'].append({
            'domain': sample['domain'],
            'timestamp': '2025-11-28T22:00:00',
            'label': 0,
            'notes': 'Known safe domain'
        })
    
    # Add malicious samples (label 2)
    for sample in malicious_samples:
        training_data['analyses'].append(sample)
        training_data['labels'].append(2)
        training_data['metadata'].append({
            'domain': sample['domain'],
            'timestamp': '2025-11-28T22:00:00',
            'label': 2,
            'notes': 'Simulated malicious pattern'
        })
    
    # Save to file
    os.makedirs('ml', exist_ok=True)
    with open('ml/training_data.json', 'w') as f:
        json.dump(training_data, f, indent=2)
    
    print("=" * 60)
    print("✅ Quick Training Data Created!")
    print("=" * 60)
    print(f"\nTotal samples: {len(training_data['analyses'])}")
    print(f"Safe domains: {training_data['labels'].count(0)}")
    print(f"Malicious domains: {training_data['labels'].count(2)}")
    print(f"\nData saved to: ml/training_data.json")
    print("\nNext step: Run 'python train_model.py'")

if __name__ == '__main__':
    create_quick_training_data()
