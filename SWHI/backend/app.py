"""
Suspicious Domain Hosting Identifier - Backend API
A Flask application for analyzing suspicious domains and revealing hosting infrastructure.
"""

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
import whois
import re
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import logging

# Configure logging FIRST (before any imports that use it)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import ML predictor
try:
    from ml.predictor import ThreatPredictor
    ML_AVAILABLE = True
except ImportError as e:
    logger.warning(f"ML module not available: {e}")
    ML_AVAILABLE = False

# Initialize Flask app
def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database configuration - make it optional
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        logger.info(f"Database URL configured: {database_url.split('@')[-1] if '@' in database_url else 'configured'}")
    else:
        # Use SQLite as fallback if PostgreSQL is not available
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///suspicious_domains.db'
        logger.info("No DATABASE_URL found - using SQLite database (suspicious_domains.db)")
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # SQLite requires special connection args
    db_uri = app.config['SQLALCHEMY_DATABASE_URI']
    if db_uri and 'sqlite' in db_uri:
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'connect_args': {'check_same_thread': False}
        }
    else:
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Database will be enabled by default, errors will be handled per-request
    app.config['DATABASE_ENABLED'] = True
    
    return app

# Initialize database
db = SQLAlchemy()

# Database Models
class AnalysisResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    real_ip = db.Column(db.String(45))
    asn = db.Column(db.String(50))
    hosting_provider = db.Column(db.String(255))
    country = db.Column(db.String(100))
    city = db.Column(db.String(100))
    is_cdn_detected = db.Column(db.Boolean, default=False)
    cdn_provider = db.Column(db.String(100))
    suspicious_score = db.Column(db.Float, default=0.0)
    raw_data = db.Column(db.Text)  # JSON string of full analysis
    
    def to_dict(self):
        return {
            'id': self.id,
            'domain': self.domain,
            'timestamp': self.timestamp.isoformat(),
            'real_ip': self.real_ip,
            'asn': self.asn,
            'hosting_provider': self.hosting_provider,
            'country': self.country,
            'city': self.city,
            'is_cdn_detected': self.is_cdn_detected,
            'cdn_provider': self.cdn_provider,
            'suspicious_score': self.suspicious_score,
            'raw_data': json.loads(self.raw_data) if self.raw_data else None
        }

# Domain Analysis Service
class DomainAnalyzer:
    def __init__(self):
        self.cdn_signatures = {
            'cloudflare': ['cloudflare', 'cf-'],
            'akamai': ['akamai', 'akamaihd'],
            'amazon': ['amazonaws', 'cloudfront'],
            'maxcdn': ['maxcdn'],
            'keycdn': ['keycdn'],
            'incapsula': ['incapdns']
        }
    
    def analyze_domain(self, domain):
        """Main analysis function that orchestrates all checks"""
        try:
            # Clean domain input
            domain = self._clean_domain(domain)
            
            analysis = {
                'domain': domain,
                'timestamp': datetime.utcnow().isoformat(),
                'dns_records': self._get_dns_records(domain),
                'ssl_info': self._get_ssl_info(domain),
                'ip_info': self._get_ip_info(domain),
                'cdn_detection': self._detect_cdn(domain),
                'subdomains': self._enumerate_subdomains(domain),
                'whois_info': self._get_whois_info(domain),
                'suspicious_score': 0.0
            }
            
            # Calculate suspicious score
            analysis['suspicious_score'] = self._calculate_suspicious_score(analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing domain {domain}: {str(e)}")
            return {'error': str(e), 'domain': domain}
    
    def _clean_domain(self, domain):
        """Clean and validate domain input"""
        domain = domain.strip().lower()
        if not domain.startswith(('http://', 'https://')):
            domain = 'https://' + domain
        
        parsed = urlparse(domain)
        return parsed.netloc or parsed.path
    
    def _get_dns_records(self, domain):
        """Get comprehensive DNS records"""
        records = {}
        
        try:
            # A records
            records['A'] = [str(r) for r in dns.resolver.resolve(domain, 'A')]
        except:
            records['A'] = []
        
        try:
            # AAAA records (IPv6)
            records['AAAA'] = [str(r) for r in dns.resolver.resolve(domain, 'AAAA')]
        except:
            records['AAAA'] = []
        
        try:
            # MX records
            records['MX'] = [str(r) for r in dns.resolver.resolve(domain, 'MX')]
        except:
            records['MX'] = []
        
        try:
            # NS records
            records['NS'] = [str(r) for r in dns.resolver.resolve(domain, 'NS')]
        except:
            records['NS'] = []
        
        try:
            # TXT records
            records['TXT'] = [str(r) for r in dns.resolver.resolve(domain, 'TXT')]
        except:
            records['TXT'] = []
        
        try:
            # CNAME records
            records['CNAME'] = [str(r) for r in dns.resolver.resolve(domain, 'CNAME')]
        except:
            records['CNAME'] = []
        
        return records
    
    def _get_ssl_info(self, domain):
        """Get SSL certificate information"""
        try:
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=10) as sock:
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
        """Get IP information and geolocation"""
        try:
            ip = socket.gethostbyname(domain)
            
            # Get geolocation info
            geo_info = self._get_geolocation(ip)
            
            # Get ASN info
            asn_info = self._get_asn_info(ip)
            
            return {
                'ip': ip,
                'geolocation': geo_info,
                'asn': asn_info,
                'is_private': ipaddress.ip_address(ip).is_private
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _get_geolocation(self, ip):
        """Get geolocation information for IP"""
        try:
            # Using ipapi.co (free tier: 1000 requests/day)
            response = requests.get(f'http://ipapi.co/{ip}/json/', timeout=10)
            if response.status_code == 200:
                data = response.json()
                return {
                    'country': data.get('country_name'),
                    'country_code': data.get('country_code'),
                    'region': data.get('region'),
                    'city': data.get('city'),
                    'latitude': data.get('latitude'),
                    'longitude': data.get('longitude'),
                    'timezone': data.get('timezone'),
                    'isp': data.get('org')
                }
        except Exception as e:
            logger.error(f"Geolocation error: {e}")
        
        return {}
    
    def _get_asn_info(self, ip):
        """Get ASN information for IP"""
        try:
            # Using ipapi.co for ASN info
            response = requests.get(f'http://ipapi.co/{ip}/json/', timeout=10)
            if response.status_code == 200:
                data = response.json()
                return {
                    'asn': data.get('asn'),
                    'org': data.get('org')
                }
        except Exception as e:
            logger.error(f"ASN lookup error: {e}")
        
        return {}
    
    def _detect_cdn(self, domain):
        """Detect if domain is behind a CDN"""
        try:
            # Check DNS records for CDN signatures
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
            
            # Check CNAME records
            for cname in dns_records.get('CNAME', []):
                for provider, signatures in self.cdn_signatures.items():
                    if any(sig in cname.lower() for sig in signatures):
                        cdn_detected = True
                        cdn_provider = provider
                        break
            
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
            # Try different DNS servers
            dns_servers = ['8.8.8.8', '1.1.1.1', '208.67.222.222']
            for dns_server in dns_servers:
                try:
                    resolver = dns.resolver.Resolver()
                    resolver.nameservers = [dns_server]
                    result = resolver.resolve(domain, 'A')
                    bypass_attempts.append({
                        'dns_server': dns_server,
                        'ips': [str(r) for r in result]
                    })
                except:
                    continue
        except Exception as e:
            logger.error(f"CDN bypass error: {e}")
        
        return bypass_attempts
    
    def _enumerate_subdomains(self, domain):
        """Enumerate subdomains using crt.sh"""
        try:
            # Use crt.sh API for subdomain enumeration
            response = requests.get(f'https://crt.sh/?q=%.{domain}&output=json', timeout=15)
            if response.status_code == 200:
                data = response.json()
                subdomains = set()
                for cert in data:
                    if cert.get('name_value'):
                        for name in cert['name_value'].split('\n'):
                            name = name.strip()
                            if name.endswith(f'.{domain}') or name == domain:
                                subdomains.add(name)
                return list(subdomains)
        except Exception as e:
            logger.error(f"Subdomain enumeration error: {e}")
        
        return []
    
    def _get_whois_info(self, domain):
        """Get WHOIS information"""
        try:
            w = whois.whois(domain)
            return {
                'registrar': w.registrar,
                'creation_date': w.creation_date.isoformat() if w.creation_date else None,
                'expiration_date': w.expiration_date.isoformat() if w.expiration_date else None,
                'name_servers': w.name_servers,
                'status': w.status,
                'emails': w.emails
            }
        except Exception as e:
            logger.error(f"WHOIS error: {e}")
            return {}
    
    def _calculate_suspicious_score(self, analysis):
        """Calculate suspicious score based on various factors"""
        score = 0.0
        
        # CDN detection adds to suspiciousness
        if analysis.get('cdn_detection', {}).get('detected'):
            score += 20
        
        # Private IP addresses are suspicious
        ip_info = analysis.get('ip_info', {})
        if ip_info.get('is_private'):
            score += 30
        
        # Recent domain registration
        whois_info = analysis.get('whois_info', {})
        if whois_info.get('creation_date'):
            try:
                creation_date = datetime.fromisoformat(whois_info['creation_date'].replace('Z', '+00:00'))
                days_old = (datetime.utcnow() - creation_date).days
                if days_old < 30:
                    score += 25
                elif days_old < 365:
                    score += 10
            except:
                pass
        
        # Suspicious hosting providers
        hosting_providers = ['cloudflare', 'incapsula', 'sucuri']
        if any(provider in str(analysis).lower() for provider in hosting_providers):
            score += 15
        
        # Multiple subdomains might indicate suspicious activity
        subdomains = analysis.get('subdomains', [])
        if len(subdomains) > 10:
            score += 10
        
        return min(score, 100.0)  # Cap at 100

# Initialize analyzer
analyzer = DomainAnalyzer()

# Initialize ML predictor
ml_predictor = None
if ML_AVAILABLE:
    try:
        ml_predictor = ThreatPredictor()
        logger.info("✅ ML predictor loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️  ML predictor initialization failed: {e}")
        logger.info("App will run without ML predictions")
        ml_predictor = None
else:
    logger.info("ML module not available - install dependencies: pip install scikit-learn pandas numpy joblib")

# Create Flask app
app = create_app()

# Routes
@app.route('/')
def index():
    return jsonify({
        'message': 'Suspicious Domain Hosting Identifier API',
        'version': '1.0.0',
        'database_enabled': app.config.get('DATABASE_ENABLED', False),
        'endpoints': {
            '/analyze': 'POST - Analyze a domain',
            '/report/<domain>': 'GET - Get analysis report (requires database)',
            '/history': 'GET - Get analysis history (requires database)'
        }
    })

@app.route('/analyze', methods=['POST'])
def analyze_domain():
    """Analyze a domain and return comprehensive results"""
    try:
        data = request.get_json()
        domain = data.get('domain')
        
        if not domain:
            return jsonify({'error': 'Domain is required'}), 400
        
        # Perform analysis
        analysis = analyzer.analyze_domain(domain)
        
        if 'error' in analysis:
            return jsonify(analysis), 500
        
        # Add ML prediction if available
        if ml_predictor:
            try:
                ml_result = ml_predictor.predict(analysis)
                analysis['ml_prediction'] = ml_result
                
                # Combine traditional score with ML score if ML is available
                if ml_result.get('ml_available'):
                    traditional_score = analysis.get('suspicious_score', 0)
                    ml_score = ml_result.get('ml_score', 0)
                    # Weighted average: 60% ML, 40% traditional
                    analysis['combined_score'] = (ml_score * 0.6) + (traditional_score * 0.4)
                    logger.info(f"ML prediction for {domain}: {ml_result.get('prediction')} "
                              f"(confidence: {ml_result.get('confidence', 0):.2f})")
            except Exception as ml_error:
                logger.warning(f"ML prediction failed for {domain}: {ml_error}")
                analysis['ml_prediction'] = {
                    'ml_available': False,
                    'error': str(ml_error)
                }
        
        # Save to database if enabled
        if app.config.get('DATABASE_ENABLED', True):
            try:
                result = AnalysisResult(
                    domain=domain,
                    real_ip=analysis.get('ip_info', {}).get('ip'),
                    asn=analysis.get('ip_info', {}).get('asn', {}).get('asn'),
                    hosting_provider=analysis.get('ip_info', {}).get('asn', {}).get('org'),
                    country=analysis.get('ip_info', {}).get('geolocation', {}).get('country'),
                    city=analysis.get('ip_info', {}).get('geolocation', {}).get('city'),
                    is_cdn_detected=analysis.get('cdn_detection', {}).get('detected', False),
                    cdn_provider=analysis.get('cdn_detection', {}).get('provider'),
                    suspicious_score=analysis.get('suspicious_score', 0.0),
                    raw_data=json.dumps(analysis)
                )
                
                db.session.add(result)
                db.session.commit()
                logger.info(f"Analysis saved to database for domain: {domain}")
            except Exception as db_error:
                logger.warning(f"Failed to save analysis to database: {db_error}")
                logger.info("Analysis completed successfully, but not saved to database")
                # Don't disable database automatically - might be temporary issue
        else:
            logger.debug("Database not available - skipping save operation")
        
        return jsonify(analysis)
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/report/<domain>')
def get_report(domain):
    """Get analysis report for a domain"""
    if not app.config.get('DATABASE_ENABLED', True):
        return jsonify({'error': 'Database not available. Please analyze the domain first.'}), 503
    
    try:
        result = AnalysisResult.query.filter_by(domain=domain).order_by(AnalysisResult.timestamp.desc()).first()
        
        if not result:
            return jsonify({'error': 'No analysis found for domain'}), 404
        
        return jsonify(result.to_dict())
        
    except Exception as e:
        logger.error(f"Report error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/history')
def get_history():
    """Get analysis history"""
    if not app.config.get('DATABASE_ENABLED', True):
        return jsonify([])  # Return empty list if database not available
    
    try:
        results = AnalysisResult.query.order_by(AnalysisResult.timestamp.desc()).limit(50).all()
        return jsonify([result.to_dict() for result in results])
        
    except Exception as e:
        logger.error(f"History error: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    if app.config.get('DATABASE_ENABLED', True):
        try:
            db.session.rollback()
        except:
            pass
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        try:
            # Try to connect and create tables
            db.engine.connect()
            db.create_all()
            logger.info("Database connection successful - tables created/verified")
            app.config['DATABASE_ENABLED'] = True
        except Exception as e:
            logger.warning(f"Database connection failed: {e}")
            logger.warning("App will run without database persistence. Analysis will still work, but history won't be saved.")
            app.config['DATABASE_ENABLED'] = False
    
    logger.info("=" * 60)
    logger.info("Starting Suspicious Domain Hosting Identifier API...")
    logger.info(f"Database enabled: {app.config.get('DATABASE_ENABLED', False)}")
    logger.info(f"API will be available at: http://0.0.0.0:5000")
    logger.info("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)


