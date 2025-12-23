from flask import Blueprint, jsonify
from datetime import datetime, timedelta, timezone
import random
import feedparser
import re
import requests

bp = Blueprint('threats', __name__, url_prefix='/api/threats')

# Real-time data sources
RSS_FEEDS = [
    "https://feeds.feedburner.com/TheHackersNews",
    "https://www.cisa.gov/sites/default/files/api/all_alerts_rss.xml",
    "https://threatpost.com/feed/"
]

# Keywords for categorization and severity
KEYWORDS = {
    'phishing': ['phishing', 'scam', 'email', 'lure', 'fake'],
    'malware': ['malware', 'virus', 'trojan', 'spyware', 'backdoor'],
    'ransomware': ['ransomware', 'encrypt', 'extortion', 'ransom'],
    'data_breach': ['breach', 'leak', 'exposed', 'database', 'credential'],
    'social_engineering': ['social engineering', 'impersonat', 'fraud']
}

SEVERITY_KEYWORDS = {
    'critical': ['critical', 'zero-day', '0-day', 'exploit', 'urgent', 'cisa'],
    'high': ['high', 'severe', 'warning', 'attack', 'vulnerability'],
    'medium': ['medium', 'risk', 'update', 'patch'],
    'low': ['low', 'info', 'note']
}

def clean_html(raw_html):
    """Remove HTML tags from description"""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext[:200] + "..." if len(cleantext) > 200 else cleantext

def determine_category(text):
    text = text.lower()
    for category, keywords in KEYWORDS.items():
        if any(k in text for k in keywords):
            return category
    return 'malware' # Default

def determine_severity(text):
    text = text.lower()
    for severity, keywords in SEVERITY_KEYWORDS.items():
        if any(k in text for k in keywords):
            return severity
    return 'medium' # Default

def fetch_real_threats():
    threats = []
    
    for feed_url in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:5]: # Get top 5 from each
                # Extract data
                title = entry.title
                description = clean_html(entry.summary if hasattr(entry, 'summary') else entry.description)
                link = entry.link
                
                # Parse date
                try:
                    # Try published_parsed struct_time
                    if hasattr(entry, 'published_parsed'):
                        dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                    else:
                        dt = datetime.now(timezone.utc)
                except:
                    dt = datetime.now(timezone.utc)

                # Determine metadata
                category = determine_category(title + " " + description)
                severity = determine_severity(title + " " + description)
                
                # Calculate time ago
                now = datetime.now(timezone.utc)
                diff = now - dt
                hours_ago = int(diff.total_seconds() / 3600)
                
                # Map category info
                category_info = {
                    'phishing': {'name': 'Phishing', 'icon': '🎣', 'color': 'red'},
                    'malware': {'name': 'Malware', 'icon': '🦠', 'color': 'orange'},
                    'ransomware': {'name': 'Ransomware', 'icon': '🔒', 'color': 'purple'},
                    'data_breach': {'name': 'Data Breach', 'icon': '💾', 'color': 'yellow'},
                    'social_engineering': {'name': 'Social Engineering', 'icon': '👥', 'color': 'blue'}
                }.get(category, {'name': 'Cyber Threat', 'icon': '⚠️', 'color': 'gray'})

                threat = {
                    'id': f"{feed_url}_{entry.get('id', title)}",
                    'category': category,
                    'category_name': category_info['name'],
                    'category_icon': category_info['icon'],
                    'category_color': category_info['color'],
                    'severity': severity,
                    'title': title,
                    'description': description,
                    'indicators': ['See source for details'],
                    'mitigation': f'Read full report at source: {link}',
                    'timestamp': dt.isoformat(),
                    'time_ago': format_time_ago(hours_ago),
                    'source_link': link
                }
                threats.append(threat)
        except Exception as e:
            print(f"Error fetching feed {feed_url}: {e}")
            continue
            
    # Sort by date
    threats.sort(key=lambda x: x['timestamp'], reverse=True)
    return threats

def format_time_ago(hours):
    if hours < 1: return 'Just now'
    elif hours == 1: return '1 hour ago'
    elif hours < 24: return f'{hours} hours ago'
    else: return f'{hours // 24} days ago'

@bp.route('/feed', methods=['GET'])
def get_threat_feed():
    """Get real-time threat intelligence feed"""
    try:
        threats = fetch_real_threats()
        
        # Fallback if no internet or empty
        if not threats:
            return jsonify({
                'success': True,
                'threats': [], # Or return simulated as fallback
                'message': 'No live threats found, check internet connection'
            })

        return jsonify({
            'success': True,
            'threats': threats,
            'last_updated': datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@bp.route('/stats', methods=['GET'])
def get_threat_stats():
    """Get stats based on REAL fetched data"""
    try:
        threats = fetch_real_threats()
        
        # Calculate stats from real data
        category_counts = {}
        severity_counts = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        
        for t in threats:
            # Category
            cat = t['category']
            category_counts[cat] = category_counts.get(cat, 0) + 1
            
            # Severity
            sev = t['severity']
            if sev in severity_counts:
                severity_counts[sev] += 1
            else:
                severity_counts['medium'] += 1 # Default

        # Format for frontend
        category_stats = {}
        cat_map = {
            'phishing': {'name': 'Phishing', 'icon': '🎣'},
            'malware': {'name': 'Malware', 'icon': '🦠'},
            'ransomware': {'name': 'Ransomware', 'icon': '🔒'},
            'data_breach': {'name': 'Data Breach', 'icon': '💾'},
            'social_engineering': {'name': 'Social Engineering', 'icon': '👥'}
        }
        
        for cat, count in category_counts.items():
            if cat in cat_map:
                category_stats[cat] = {
                    'name': cat_map[cat]['name'],
                    'icon': cat_map[cat]['icon'],
                    'count': count,
                    'trend': 'stable'
                }

        return jsonify({
            'success': True,
            'category_stats': category_stats,
            'severity_stats': severity_counts,
            'total_threats_24h': len(threats),
            'last_updated': datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
