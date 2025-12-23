import os
import ssl
import socket
import json
import requests
import dns.resolver
import dns.reversename
import ipaddress
from datetime import datetime, timedelta
from urllib.parse import urlparse
import re
import logging
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class DomainAnalyzer:
    """Domain analysis service for SWHI"""
    
    def __init__(self):
        self.cdn_signatures = {
            'cloudflare': ['cloudflare', 'cf-'],
            'akamai': ['akamai', 'akamaihd'],
            'amazon': ['amazonaws', 'cloudfront'],
            'maxcdn': ['maxcdn'],
            'keycdn': ['keycdn'],
            'incapsula': ['incapdns']
        }
        
        # Suspicious TLDs
        self.suspicious_tlds = [
            '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', 
            '.work', '.click', '.link', '.download', '.racing',
            '.stream', '.win', '.bid', '.trade', '.webcam', '.loan',
            '.date', '.faith', '.accountant', '.cricket', '.science'
        ]
        
        # Phishing Keywords
        self.phishing_keywords = [
            'login', 'verify', 'account', 'secure', 'update', 'confirm',
            'banking', 'paypal', 'signin', 'suspended', 'support', 'service',
            'official', 'webmail', 'portal', 'checkout', 'billing', 'wallet',
            'blockchain', 'coinbase', 'binance', 'metamask', 'trustwallet'
        ]
        
        # Whitelist of trusted domains/brands to prevent false positives
        self.trusted_brands = [
            'google', 'microsoft', 'apple', 'amazon', 'facebook', 'facebookmail',
            'axisbank', 'bankofbaroda', 'hdfcbank', 'icicibank', 'sbi.co.in',
            'onlinesbi', 'pnbindia', 'canarabank', 'unionbankofindia',
            'idbi', 'kotak', 'yesbank', 'indusind', 'rblbank', 'hsbc', 'standardchartered',
            'morganstanley', 'jpmorgan', 'goldmansachs', 'barclays', 'citibank',
            'paypal', 'paytm', 'phonepe', 'googlepay', 'razorpay'
        ]
    
    def analyze_domain(self, domain):
        """Main analysis function that orchestrates all checks in parallel"""
        try:
            # Clean domain input
            domain = self._clean_domain(domain)
            
            # Sanitize input to prevent SSRF
            if self._is_suspicious_input(domain):
                raise ValueError("Invalid or suspicious domain input")
            
            analysis = {
                'domain': domain,
                'timestamp': datetime.utcnow().isoformat(),
                'suspicious_score': 0.0
            }

            # Use ThreadPoolExecutor to run independent checks in parallel
            with ThreadPoolExecutor(max_workers=5) as executor:
                # Submit tasks
                dns_future = executor.submit(self._get_dns_records, domain)
                ssl_future = executor.submit(self._get_ssl_info, domain)
                ip_future = executor.submit(self._get_ip_info, domain)
                subdomain_future = executor.submit(self._enumerate_subdomains, domain)
                whois_future = executor.submit(self._get_whois_info, domain)
                
                # Wait for results
                analysis['dns_records'] = dns_future.result()
                analysis['ssl_info'] = ssl_future.result()
                analysis['ip_info'] = ip_future.result()
                analysis['subdomains'] = subdomain_future.result()
                analysis['whois_info'] = whois_future.result()
            
            # CDN detection requires DNS records
            analysis['cdn_detection'] = self._detect_cdn(domain, analysis['dns_records'])
            
            # Determine domain status
            analysis['domain_status'] = self._determine_domain_status(analysis)
            
            # Calculate suspicious score
            analysis['suspicious_score'] = self._calculate_suspicious_score(analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing domain {domain}: {str(e)}")
            return {'error': str(e), 'domain': domain}
    
    def _clean_domain(self, domain):
        """Clean and validate domain input intensely"""
        # Remove spaces and common accidental characters
        domain = domain.strip().lower().replace(' ', '')
        
        # If it's just a name without a dot, assume .com or .in
        if '.' not in domain:
            # Try to resolve .com first, then .in (simplification)
            domain = domain + ".com"
            
        if not domain.startswith(('http://', 'https://')):
            domain = 'https://' + domain
        
        try:
            parsed = urlparse(domain)
            netloc = parsed.netloc or parsed.path
            # Remove www. prefix for consistent internal handling if needed
            # but usually we want to preserve it for resolution
            return netloc
        except:
            return domain
    
    def _is_suspicious_input(self, domain):
        """Check for SSRF and malicious input patterns"""
        # Block private IPs
        try:
            ip = socket.gethostbyname(domain)
            if ipaddress.ip_address(ip).is_private:
                return True
        except:
            pass
        
        # Block localhost variants
        localhost_patterns = ['localhost', '127.0.0.1', '0.0.0.0', '[::]']
        if any(pattern in domain.lower() for pattern in localhost_patterns):
            return True
        
        return False
    
    def _get_dns_records(self, domain):
        """Get comprehensive DNS records"""
        records = {}
        record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME']
        
        for rtype in record_types:
            try:
                records[rtype] = [str(r) for r in dns.resolver.resolve(domain, rtype)]
            except:
                records[rtype] = []
        
        return records
    
    def _get_ssl_info(self, domain):
        """Get SSL certificate information"""
        try:
            context = ssl.create_default_context()
            # Set a shorter timeout for SSL handshake
            with socket.create_connection((domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    return {
                        'subject': dict(x[0] for x in cert.get('subject', [])),
                        'issuer': dict(x[0] for x in cert.get('issuer', [])),
                        'version': cert.get('version'),
                        'serial_number': cert.get('serialNumber'),
                        'not_before': cert.get('notBefore'),
                        'not_after': cert.get('notAfter'),
                        'subject_alt_names': cert.get('subjectAltName', []),
                        'valid': self._is_ssl_valid(cert)
                    }
        except Exception as e:
            return {'error': str(e)}
    
    def _is_ssl_valid(self, cert):
        """Check if SSL certificate is valid"""
        try:
            not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
            return not_after > datetime.utcnow()
        except:
            return False
    
    def _get_ip_info(self, domain):
        """Get IP information and geolocation (Combined for speed)"""
        try:
            ip = socket.gethostbyname(domain)
            
            # Using ipapi.co (free tier: 1000 requests/day)
            # Combine geolocation and ASN into one request
            response = requests.get(f'http://ipapi.co/{ip}/json/', timeout=8)
            geo_info = {}
            asn_info = {}
            
            if response.status_code == 200:
                data = response.json()
                geo_info = {
                    'country': data.get('country_name'),
                    'country_code': data.get('country_code'),
                    'region': data.get('region'),
                    'city': data.get('city'),
                    'latitude': data.get('latitude'),
                    'longitude': data.get('longitude'),
                    'timezone': data.get('timezone'),
                    'isp': data.get('org')
                }
                asn_info = {
                    'asn': data.get('asn'),
                    'org': data.get('org')
                }
            
            return {
                'ip': ip,
                'geolocation': geo_info,
                'asn': asn_info,
                'is_private': ipaddress.ip_address(ip).is_private
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _detect_cdn(self, domain, dns_records=None):
        """Detect if domain is behind a CDN (Uses provided DNS records)"""
        try:
            if dns_records is None:
                dns_records = self._get_dns_records(domain)
                
            cdn_detected = False
            cdn_provider = None
            
            # Check A records for CDN IPs
            for ip in dns_records.get('A', []):
                for provider, signatures in self.cdn_signatures.items():
                    if any(sig in ip.lower() for sig in signatures):
                        cdn_detected = True
                        cdn_provider = provider
                        break
                if cdn_detected: break
            
            # Check CNAME records
            if not cdn_detected:
                for cname in dns_records.get('CNAME', []):
                    for provider, signatures in self.cdn_signatures.items():
                        if any(sig in cname.lower() for sig in signatures):
                            cdn_detected = True
                            cdn_provider = provider
                            break
                    if cdn_detected: break
            
            return {
                'detected': cdn_detected,
                'provider': cdn_provider,
                'bypass_attempts': self._attempt_cdn_bypass(domain)
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _attempt_cdn_bypass(self, domain):
        """Attempt to bypass CDN to find real hosting"""
        bypass_attempts = []
        
        try:
            # Try different DNS servers in parallel for bypass
            dns_servers = ['8.8.8.8', '1.1.1.1', '208.67.222.222']
            def check_dns(dns_server):
                try:
                    resolver = dns.resolver.Resolver()
                    resolver.nameservers = [dns_server]
                    resolver.timeout = 2
                    resolver.lifetime = 2
                    result = resolver.resolve(domain, 'A')
                    return {
                        'dns_server': dns_server,
                        'ips': [str(r) for r in result]
                    }
                except:
                    return None

            with ThreadPoolExecutor(max_workers=3) as executor:
                results = list(executor.map(check_dns, dns_servers))
                bypass_attempts = [r for r in results if r]
                
        except Exception as e:
            logger.error(f"CDN bypass error: {e}")
        
        return bypass_attempts
    
    def _enumerate_subdomains(self, domain):
        """Enumerate subdomains using crt.sh (with short timeout)"""
        try:
            # Use crt.sh API with a strict timeout as it can be slow
            response = requests.get(f'https://crt.sh/?q=%.{domain}&output=json', timeout=5)
            if response.status_code == 200:
                data = response.json()
                subdomains = set()
                for cert in data:
                    if cert.get('name_value'):
                        for name in cert['name_value'].split('\n'):
                            name = name.strip()
                            if name.endswith(f'.{domain}') or name == domain:
                                subdomains.add(name)
                return list(subdomains)[:50]  # Limit to 50 subdomains
        except Exception as e:
            logger.warning(f"Subdomain enumeration timeout/error (skipping): {e}")
        
        return []
    
    def _get_whois_info(self, domain):
        """Get WHOIS information"""
        try:
            import whois
            # Many WHOIS libraries can be slow, adding a wrapper for safety if needed
            # but usually the library call itself is blocking.
            w = whois.whois(domain)
            
            # Handle date conversion
            creation_date = None
            expiration_date = None
            
            if hasattr(w, 'creation_date') and w.creation_date:
                if isinstance(w.creation_date, list):
                    creation_date = w.creation_date[0].isoformat() if w.creation_date[0] else None
                elif isinstance(w.creation_date, datetime):
                    creation_date = w.creation_date.isoformat()
            
            if hasattr(w, 'expiration_date') and w.expiration_date:
                if isinstance(w.expiration_date, list):
                    expiration_date = w.expiration_date[0].isoformat() if w.expiration_date[0] else None
                elif isinstance(w.expiration_date, datetime):
                    expiration_date = w.expiration_date.isoformat()
            
            return {
                'registrar': w.registrar if hasattr(w, 'registrar') else None,
                'creation_date': creation_date,
                'expiration_date': expiration_date,
                'name_servers': w.name_servers if hasattr(w, 'name_servers') else [],
                'status': w.status if hasattr(w, 'status') else None,
                'emails': w.emails if hasattr(w, 'emails') else []
            }
        except Exception as e:
            logger.error(f"WHOIS error: {e}")
            return {}
    
    def _calculate_suspicious_score(self, analysis):
        """Calculate suspicious score based on various factors"""
        score = 0.0
        domain = analysis.get('domain', '').lower()
        
        # 0. Trusted Brand check (pre-emptive discount)
        if any(brand in domain for brand in self.trusted_brands):
            score -= 50 # Significant discount for known trusted brands
            
        # 1. Domain-based heuristics (very important for phishing)
        # Check if domain resolves
        dns_records = analysis.get('dns_records', {})
        if not any(dns_records.get(t, []) for t in ['A', 'AAAA', 'MX', 'NS']):
            score += 35 # High risk if domain doesn't resolve at all
            
        # Suspicious TLDs
        if any(domain.endswith(tld) for tld in self.suspicious_tlds):
            score += 25
            
        # Phishing Keywords
        if any(keyword in domain for keyword in self.phishing_keywords):
            score += 30
            
        # Domain structure
        dot_count = domain.count('.')
        hyphen_count = domain.count('-')
        digit_count = sum(c.isdigit() for c in domain)
        
        if dot_count > 3: score += 10
        if hyphen_count > 2: score += 15
        if digit_count > 3: score += 10
        
        # Domain Entropy (randomness)
        entropy = self._calculate_entropy(domain)
        if entropy > 4.0: score += 20
        
        # 2. Hosting-based indicators
        # CDN detection adds to suspiciousness
        if analysis.get('cdn_detection', {}).get('detected'):
            score += 15
        
        # Private IP addresses are very suspicious for public domains
        ip_info = analysis.get('ip_info', {})
        if ip_info and ip_info.get('is_private'):
            score += 40
        
        # 3. WHOIS-based indicators
        whois_info = analysis.get('whois_info', {})
        if whois_info and whois_info.get('creation_date'):
            try:
                creation_date_str = whois_info['creation_date']
                if '+' in creation_date_str:
                    creation_date_str = creation_date_str.split('+')[0]
                creation_date = datetime.fromisoformat(creation_date_str)
                days_old = (datetime.utcnow() - creation_date).days
                
                if days_old < 30:
                    score += 40 # Extremely high risk for very new domains
                elif days_old < 90:
                    score += 25
                elif days_old < 365:
                    score += 10
            except:
                pass
        else:
            # Missing WHOIS info often associated with newer/suspicious domains
            score += 15
            
        # 4. SSL-based indicators
        ssl_info = analysis.get('ssl_info', {})
        if 'error' in ssl_info:
            score += 20
        else:
            issuer = str(ssl_info.get('issuer', {})).lower()
            if "let's encrypt" in issuer or "zerossl" in issuer:
                # Free SSL is common in phishing (though legitimate too)
                score += 5
        
        # 5. Geolocation risk
        geo = ip_info.get('geolocation', {}) if ip_info else {}
        high_risk_countries = ['CN', 'RU', 'KP', 'IR', 'SY', 'VN']
        if geo.get('country_code') in high_risk_countries:
            score += 20
            
        return min(score, 100.0)  # Cap at 100

    def _determine_domain_status(self, analysis):
        """Determine if domain is active, parket, or unregistered"""
        dns_records = analysis.get('dns_records', {})
        has_dns = any(dns_records.get(t, []) for t in ['A', 'AAAA', 'MX', 'NS'])
        
        if has_dns:
            return "active"
            
        whois_info = analysis.get('whois_info', {})
        if not whois_info or not whois_info.get('registrar'):
            return "unregistered"
            
        return "inactive/parked"

    def _calculate_entropy(self, string):
        """Calculate Shannon entropy of a string to detect randomized domains"""
        import math
        from collections import Counter
        if not string:
            return 0
        counts = Counter(string)
        length = len(string)
        entropy = 0
        for count in counts.values():
            p = count / length
            entropy -= p * math.log2(p)
        return entropy

