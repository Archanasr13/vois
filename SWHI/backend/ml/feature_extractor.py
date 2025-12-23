"""
Feature Extractor for ML-based Threat Detection
Extracts numerical features from domain analysis data
"""

import re
from datetime import datetime
from urllib.parse import urlparse
import math
from collections import Counter

class FeatureExtractor:
    """Extract features from domain analysis for ML model"""
    
    def __init__(self):
        # Suspicious TLDs (top-level domains)
        self.suspicious_tlds = [
            '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', 
            '.work', '.click', '.link', '.download', '.racing',
            '.stream', '.win', '.bid', '.trade', '.webcam'
        ]
        
        # Trusted hosting providers
        self.trusted_providers = [
            'amazon', 'google', 'microsoft', 'cloudflare', 
            'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner'
        ]
    
    def extract_features(self, analysis_data):
        """
        Extract features from analysis data
        Returns: dict of numerical features
        """
        features = {}
        
        # Domain-based features
        domain = analysis_data.get('domain', '')
        features.update(self._extract_domain_features(domain))
        
        # DNS-based features
        dns_records = analysis_data.get('dns_records', {})
        features.update(self._extract_dns_features(dns_records))
        
        # SSL-based features
        ssl_info = analysis_data.get('ssl_info', {})
        features.update(self._extract_ssl_features(ssl_info))
        
        # IP-based features
        ip_info = analysis_data.get('ip_info', {})
        features.update(self._extract_ip_features(ip_info))
        
        # CDN-based features
        cdn_info = analysis_data.get('cdn_detection', {})
        features.update(self._extract_cdn_features(cdn_info))
        
        # WHOIS-based features
        whois_info = analysis_data.get('whois_info', {})
        features.update(self._extract_whois_features(whois_info))
        
        # Subdomain features
        subdomains = analysis_data.get('subdomains', [])
        features.update(self._extract_subdomain_features(subdomains))
        
        return features
    
    def _extract_domain_features(self, domain):
        """Extract features from domain name"""
        features = {}
        
        # Domain length
        features['domain_length'] = len(domain)
        
        # Number of dots
        features['dot_count'] = domain.count('.')
        
        # Number of hyphens
        features['hyphen_count'] = domain.count('-')
        
        # Number of digits
        features['digit_count'] = sum(c.isdigit() for c in domain)
        
        # Has suspicious TLD
        features['has_suspicious_tld'] = int(any(
            domain.endswith(tld) for tld in self.suspicious_tlds
        ))
        
        # Domain entropy (randomness)
        features['domain_entropy'] = self._calculate_entropy(domain)
        
        # Has IP address in domain
        features['has_ip_in_domain'] = int(bool(
            re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain)
        ))
        
        # Vowel to consonant ratio
        vowels = sum(1 for c in domain.lower() if c in 'aeiou')
        consonants = sum(1 for c in domain.lower() if c.isalpha() and c not in 'aeiou')
        features['vowel_consonant_ratio'] = vowels / max(consonants, 1)
        
        # Has common phishing keywords
        phishing_keywords = ['login', 'verify', 'account', 'secure', 'update', 
                            'confirm', 'banking', 'paypal', 'signin', 'suspended']
        features['has_phishing_keyword'] = int(any(
            keyword in domain.lower() for keyword in phishing_keywords
        ))
        
        # Consecutive consonants (suspicious pattern)
        max_consonants = 0
        current_consonants = 0
        for c in domain.lower():
            if c.isalpha() and c not in 'aeiou':
                current_consonants += 1
                max_consonants = max(max_consonants, current_consonants)
            else:
                current_consonants = 0
        features['max_consecutive_consonants'] = max_consonants
        
        return features
    
    def _extract_dns_features(self, dns_records):
        """Extract features from DNS records"""
        features = {}
        
        # Number of A records
        features['a_record_count'] = len(dns_records.get('A', []))
        
        # Number of MX records
        features['mx_record_count'] = len(dns_records.get('MX', []))
        
        # Number of NS records
        features['ns_record_count'] = len(dns_records.get('NS', []))
        
        # Number of TXT records
        features['txt_record_count'] = len(dns_records.get('TXT', []))
        
        # Has AAAA (IPv6) records
        features['has_ipv6'] = int(len(dns_records.get('AAAA', [])) > 0)
        
        # Has CNAME records
        features['has_cname'] = int(len(dns_records.get('CNAME', [])) > 0)
        
        # Total DNS record count
        total_records = sum(len(records) for records in dns_records.values())
        features['total_dns_records'] = total_records
        
        # Has no MX records (suspicious for legitimate domains)
        features['no_mx_records'] = int(len(dns_records.get('MX', [])) == 0)
        
        return features
    
    def _extract_ssl_features(self, ssl_info):
        """Extract features from SSL certificate"""
        features = {}
        
        # Has valid SSL
        features['ssl_valid'] = int(ssl_info.get('valid', False))
        
        # SSL certificate age (days until expiry)
        if 'not_after' in ssl_info and ssl_info['not_after']:
            try:
                expiry = datetime.strptime(ssl_info['not_after'], '%b %d %H:%M:%S %Y %Z')
                days_until_expiry = (expiry - datetime.utcnow()).days
                features['ssl_days_until_expiry'] = max(days_until_expiry, 0)
            except:
                features['ssl_days_until_expiry'] = 0
        else:
            features['ssl_days_until_expiry'] = 0
        
        # Has SSL error
        features['has_ssl_error'] = int('error' in ssl_info)
        
        # Number of subject alternative names
        san_count = len(ssl_info.get('subject_alt_names', []))
        features['ssl_san_count'] = san_count
        
        # Is Let's Encrypt (free SSL - common in phishing)
        issuer = str(ssl_info.get('issuer', {})).lower()
        features['is_lets_encrypt'] = int('let\'s encrypt' in issuer or 'letsencrypt' in issuer)
        
        # Certificate is very new (< 30 days until expiry suggests new cert)
        features['ssl_very_new'] = int(features['ssl_days_until_expiry'] > 60 and 
                                       features['ssl_days_until_expiry'] < 90)
        
        return features
    
    def _extract_ip_features(self, ip_info):
        """Extract features from IP information"""
        features = {}
        
        # Is private IP
        features['is_private_ip'] = int(ip_info.get('is_private', False))
        
        # Has geolocation data
        geo = ip_info.get('geolocation', {})
        features['has_geolocation'] = int(bool(geo.get('country')))
        
        # Country risk score (simplified - you can expand this)
        high_risk_countries = ['CN', 'RU', 'KP', 'IR', 'SY', 'VN']
        country_code = geo.get('country_code', '')
        features['high_risk_country'] = int(country_code in high_risk_countries)
        
        # Has ASN info
        asn = ip_info.get('asn', {})
        features['has_asn'] = int(bool(asn.get('asn')))
        
        # Trusted hosting provider
        org = str(asn.get('org', '')).lower()
        features['trusted_hosting'] = int(any(
            provider in org for provider in self.trusted_providers
        ))
        
        # Unknown/suspicious hosting
        features['unknown_hosting'] = int(not features['trusted_hosting'] and features['has_asn'])
        
        return features
    
    def _extract_cdn_features(self, cdn_info):
        """Extract features from CDN detection"""
        features = {}
        
        # CDN detected
        features['cdn_detected'] = int(cdn_info.get('detected', False))
        
        # CDN provider (encoded)
        provider = cdn_info.get('provider', '')
        features['is_cloudflare'] = int(provider == 'cloudflare')
        features['is_akamai'] = int(provider == 'akamai')
        features['is_amazon_cdn'] = int(provider == 'amazon')
        
        # Number of bypass attempts
        bypass_attempts = cdn_info.get('bypass_attempts', [])
        features['cdn_bypass_count'] = len(bypass_attempts)
        
        return features
    
    def _extract_whois_features(self, whois_info):
        """Extract features from WHOIS data"""
        features = {}
        
        # Domain age (days since creation)
        if whois_info.get('creation_date'):
            try:
                creation_date = whois_info['creation_date']
                if isinstance(creation_date, str):
                    creation = datetime.fromisoformat(
                        creation_date.replace('Z', '+00:00')
                    )
                else:
                    creation = creation_date
                
                domain_age_days = (datetime.utcnow() - creation.replace(tzinfo=None)).days
                features['domain_age_days'] = max(domain_age_days, 0)
                
                # Very new domain (< 30 days)
                features['very_new_domain'] = int(domain_age_days < 30)
                
                # New domain (< 365 days)
                features['new_domain'] = int(domain_age_days < 365)
            except:
                features['domain_age_days'] = 0
                features['very_new_domain'] = 0
                features['new_domain'] = 0
        else:
            features['domain_age_days'] = 0
            features['very_new_domain'] = 0
            features['new_domain'] = 0
        
        # Has privacy protection
        registrar = str(whois_info.get('registrar', '')).lower()
        features['has_privacy_protection'] = int(
            'privacy' in registrar or 'protected' in registrar or 'redacted' in registrar
        )
        
        # Has registrar info
        features['has_registrar'] = int(bool(whois_info.get('registrar')))
        
        # Number of name servers
        name_servers = whois_info.get('name_servers', [])
        if isinstance(name_servers, list):
            features['nameserver_count'] = len(name_servers)
        else:
            features['nameserver_count'] = 0
        
        return features
    
    def _extract_subdomain_features(self, subdomains):
        """Extract features from subdomains"""
        features = {}
        
        # Number of subdomains
        features['subdomain_count'] = len(subdomains)
        
        # Has many subdomains (potential indicator)
        features['has_many_subdomains'] = int(len(subdomains) > 10)
        
        # Has very many subdomains (very suspicious)
        features['has_very_many_subdomains'] = int(len(subdomains) > 50)
        
        # Average subdomain length
        if subdomains:
            avg_length = sum(len(s) for s in subdomains) / len(subdomains)
            features['avg_subdomain_length'] = avg_length
        else:
            features['avg_subdomain_length'] = 0
        
        return features
    
    def _calculate_entropy(self, string):
        """Calculate Shannon entropy of a string"""
        if not string:
            return 0
        
        # Count character frequencies
        counter = Counter(string)
        length = len(string)
        
        # Calculate entropy
        entropy = 0
        for count in counter.values():
            probability = count / length
            entropy -= probability * math.log2(probability)
        
        return entropy
    
    def get_feature_names(self):
        """Return list of all feature names in order"""
        return [
            # Domain features (11)
            'domain_length', 'dot_count', 'hyphen_count', 'digit_count',
            'has_suspicious_tld', 'domain_entropy', 'has_ip_in_domain',
            'vowel_consonant_ratio', 'has_phishing_keyword', 'max_consecutive_consonants',
            
            # DNS features (8)
            'a_record_count', 'mx_record_count', 'ns_record_count',
            'txt_record_count', 'has_ipv6', 'has_cname', 'total_dns_records',
            'no_mx_records',
            
            # SSL features (7)
            'ssl_valid', 'ssl_days_until_expiry', 'has_ssl_error',
            'ssl_san_count', 'is_lets_encrypt', 'ssl_very_new',
            
            # IP features (6)
            'is_private_ip', 'has_geolocation', 'high_risk_country',
            'has_asn', 'trusted_hosting', 'unknown_hosting',
            
            # CDN features (5)
            'cdn_detected', 'is_cloudflare', 'is_akamai',
            'is_amazon_cdn', 'cdn_bypass_count',
            
            # WHOIS features (7)
            'domain_age_days', 'very_new_domain', 'new_domain',
            'has_privacy_protection', 'has_registrar', 'nameserver_count',
            
            # Subdomain features (4)
            'subdomain_count', 'has_many_subdomains', 'has_very_many_subdomains',
            'avg_subdomain_length'
        ]
