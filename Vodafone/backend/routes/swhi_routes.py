"""
SWHI Routes for Vodafone Platform
API endpoints for domain analysis functionality
"""

from flask import Blueprint, request, jsonify, current_app
from functools import wraps
import json
import logging
from datetime import datetime
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import db

logger = logging.getLogger(__name__)

# Create SWHI blueprint
swhi_bp = Blueprint('swhi', __name__, url_prefix='/api/swhi')

# Import analyzer
try:
    from swhi.analyzer import DomainAnalyzer
    # Initialize analyzer
    analyzer = DomainAnalyzer()
    logger.info("✅ SWHI analyzer loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load SWHI analyzer: {e}")
    analyzer = None

# Import ML predictor if available
ml_predictor = None
try:
    from swhi.ml.predictor import ThreatPredictor
    ml_predictor = ThreatPredictor()
    logger.info("✅ SWHI ML predictor loaded successfully")
except Exception as e:
    logger.warning(f"⚠️  SWHI ML predictor not available: {e}")

# Rate limiting decorator (simple implementation)
analysis_timestamps = {}

def rate_limit(max_requests=5, window_minutes=1):
    """Simple rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get user identifier (could be IP or user_id)
            identifier = request.remote_addr
            
            current_time = datetime.utcnow()
            if identifier in analysis_timestamps:
                timestamps = analysis_timestamps[identifier]
                # Remove timestamps older than window
                timestamps = [t for t in timestamps if (current_time - t).total_seconds() < window_minutes * 60]
                
                if len(timestamps) >= max_requests:
                    return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429
                
                timestamps.append(current_time)
                analysis_timestamps[identifier] = timestamps
            else:
                analysis_timestamps[identifier] = [current_time]
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# SWHI Analysis Model
class SWHIAnalysis(db.Model):
    """Database model for SWHI analysis results"""
    __tablename__ = 'swhi_analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    real_ip = db.Column(db.String(45))
    asn = db.Column(db.String(50))
    hosting_provider = db.Column(db.String(255))
    country = db.Column(db.String(100))
    city = db.Column(db.String(100))
    is_cdn_detected = db.Column(db.Boolean, default=False)
    cdn_provider = db.Column(db.String(100))
    suspicious_score = db.Column(db.Float, default=0.0)
    combined_score = db.Column(db.Float, default=0.0)
    ml_prediction = db.Column(db.String(50))
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
            'combined_score': self.combined_score,
            'ml_prediction': self.ml_prediction,
            'raw_data': json.loads(self.raw_data) if self.raw_data else None
        }

# Routes
@swhi_bp.route('/analyze', methods=['POST'])
@rate_limit(max_requests=5, window_minutes=1)
def analyze_domain():
    """Analyze a domain and return comprehensive results"""
    try:
        # Check if analyzer is available
        if analyzer is None:
            return jsonify({'error': 'SWHI analyzer not available. Please check backend logs.'}), 503
        
        data = request.get_json()
        domain = data.get('domain')
        
        if not domain:
            return jsonify({'error': 'Domain is required'}), 400
        
        logger.info(f"Analyzing domain: {domain}")
        
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
                    # Weighted average: 50% ML, 50% traditional
                    analysis['combined_score'] = (ml_score * 0.5) + (traditional_score * 0.5)
                    logger.info(f"ML prediction for {domain}: {ml_result.get('prediction')} "
                              f"(confidence: {ml_result.get('confidence', 0):.2f})")
            except Exception as ml_error:
                logger.warning(f"ML prediction failed for {domain}: {ml_error}")
                analysis['ml_prediction'] = {
                    'ml_available': False,
                    'error': str(ml_error)
                }
        
        # Save to database
        try:
            result = SWHIAnalysis(
                domain=domain,
                # user_id can be added if you want to track which user ran the analysis
                real_ip=analysis.get('ip_info', {}).get('ip'),
                asn=analysis.get('ip_info', {}).get('asn', {}).get('asn'),
                hosting_provider=analysis.get('ip_info', {}).get('asn', {}).get('org'),
                country=analysis.get('ip_info', {}).get('geolocation', {}).get('country'),
                city=analysis.get('ip_info', {}).get('geolocation', {}).get('city'),
                is_cdn_detected=analysis.get('cdn_detection', {}).get('detected', False),
                cdn_provider=analysis.get('cdn_detection', {}).get('provider'),
                suspicious_score=analysis.get('suspicious_score', 0.0),
                combined_score=analysis.get('combined_score', analysis.get('suspicious_score', 0.0)),
                ml_prediction=analysis.get('ml_prediction', {}).get('prediction') if analysis.get('ml_prediction') else None,
                raw_data=json.dumps(analysis)
            )
            
            db.session.add(result)
            db.session.commit()
            logger.info(f"Analysis saved to database for domain: {domain}")
        except Exception as db_error:
            logger.warning(f"Failed to save analysis to database: {db_error}")
            # Continue anyway - analysis worked, just DB save failed
        
        return jsonify(analysis)
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@swhi_bp.route('/history', methods=['GET'])
def get_history():
    """Get analysis history"""
    try:
        results = SWHIAnalysis.query.order_by(SWHIAnalysis.timestamp.desc()).limit(50).all()
        return jsonify([{
            'domain': r.domain,
            'timestamp': r.timestamp.isoformat(),
            'suspicious_score': r.combined_score or r.suspicious_score
        } for r in results])
    except Exception as e:
        logger.error(f"History error: {str(e)}")
        return jsonify([])  # Return empty list on error

@swhi_bp.route('/result/<int:analysis_id>', methods=['GET'])
def get_result(analysis_id):
    """Get detailed analysis result by ID"""
    try:
        result = SWHIAnalysis.query.get(analysis_id)
        
        if not result:
            return jsonify({'error': 'Analysis not found'}), 404
        
        return jsonify(result.to_dict())
    except Exception as e:
        logger.error(f"Result fetch error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@swhi_bp.route('/report/<int:analysis_id>.pdf', methods=['GET'])
def get_pdf_report(analysis_id):
    """Generate and download PDF report for an analysis"""
    try:
        result = SWHIAnalysis.query.get(analysis_id)
        
        if not result:
            return jsonify({'error': 'Analysis not found'}), 404
        
        # For now, return a simple JSON response
        # TODO: Implement PDF generation using reportlab
        return jsonify({
            'message': 'PDF generation not yet implemented',
            'analysis_id': analysis_id,
            'domain': result.domain
        })
    except Exception as e:
        logger.error(f"PDF generation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@swhi_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get SWHI usage statistics"""
    try:
        total_analyses = SWHIAnalysis.query.count()
        high_risk_count = SWHIAnalysis.query.filter(SWHIAnalysis.combined_score >= 70).count()
        medium_risk_count = SWHIAnalysis.query.filter(
            SWHIAnalysis.combined_score >= 40,
            SWHIAnalysis.combined_score < 70
        ).count()
        low_risk_count = SWHIAnalysis.query.filter(SWHIAnalysis.combined_score < 40).count()
        
        return jsonify({
            'total_analyses': total_analyses,
            'high_risk': high_risk_count,
            'medium_risk': medium_risk_count,
            'low_risk': low_risk_count,
            'ml_available': ml_predictor is not None
        })
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Alias for blueprint registration
bp = swhi_bp
