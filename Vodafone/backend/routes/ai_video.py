from flask import Blueprint, jsonify, request
from datetime import datetime
import random
import json

bp = Blueprint('ai_video', __name__, url_prefix='/api/ai')

# Dynamic script templates for different simulation types
SCRIPT_TEMPLATES = {
    'phishing': {
        'intros': [
            "I noticed you clicked on a suspicious link in that email.",
            "You just interacted with a phishing attempt.",
            "That email you clicked was a simulated phishing attack.",
            "Hold on - that link you clicked wasn't safe.",
        ],
        'explanations': [
            "Phishing emails are designed to trick you into revealing sensitive information or downloading malware.",
            "Cybercriminals use fake emails to steal your credentials and access company systems.",
            "These deceptive emails can lead to data breaches, financial loss, and compromised security.",
            "Attackers craft convincing messages to manipulate you into taking dangerous actions.",
        ],
        'dangers': [
            "Clicking such links can install malware, steal your passwords, or give hackers access to our network.",
            "This could result in identity theft, financial fraud, or a complete system compromise.",
            "One wrong click can expose confidential data and put the entire organization at risk.",
            "Malicious links can encrypt your files, steal credentials, or create backdoors for attackers.",
        ],
        'tips': [
            [
                "Always hover over links to see the real URL before clicking",
                "Check the sender's email address carefully for misspellings",
                "Look for urgency tactics - legitimate companies rarely demand immediate action",
                "When in doubt, contact the sender through official channels"
            ],
            [
                "Verify sender addresses match official company domains",
                "Be suspicious of unexpected attachments or links",
                "Report suspicious emails to your IT security team immediately",
                "Never enter credentials on pages you reached via email links"
            ],
            [
                "Enable multi-factor authentication on all accounts",
                "Check for HTTPS and valid security certificates",
                "Watch for poor grammar and spelling mistakes",
                "Use your company's official portal instead of email links"
            ]
        ],
        'conclusions': [
            "Stay vigilant and think before you click!",
            "Remember: when in doubt, verify through official channels.",
            "Your awareness is our best defense against cyber threats.",
            "Together, we can keep our organization secure.",
        ]
    },
    'credential_submit': {
        'intros': [
            "You just submitted your credentials on an untrusted page.",
            "I see you entered your password on a suspicious form.",
            "That login page you used wasn't legitimate.",
            "You've just shared sensitive information with a fake website.",
        ],
        'explanations': [
            "Fake login pages are a common tactic to harvest usernames and passwords.",
            "Attackers create convincing replicas of real login pages to steal credentials.",
            "These credential harvesting attacks can compromise your entire account.",
            "Phishing sites mimic legitimate services to trick users into entering passwords.",
        ],
        'dangers': [
            "With your credentials, attackers can access your email, files, and sensitive company data.",
            "Stolen passwords can be used across multiple services if you reuse them.",
            "This could lead to unauthorized access, data theft, and financial fraud.",
            "Compromised accounts can be used to launch further attacks on colleagues.",
        ],
        'tips': [
            [
                "Always check the URL carefully before entering credentials",
                "Look for HTTPS and a valid security certificate",
                "Use a password manager to avoid typing passwords on fake sites",
                "Enable two-factor authentication on all accounts"
            ],
            [
                "Bookmark official login pages and use them directly",
                "Never click login links from emails - type the URL manually",
                "Watch for subtle misspellings in domain names",
                "Report suspicious login pages to IT security immediately"
            ],
            [
                "Use unique passwords for each service",
                "Check for the padlock icon in your browser's address bar",
                "Be wary of login pages that appear after clicking email links",
                "Verify the domain matches the official company website"
            ]
        ],
        'conclusions': [
            "Protect your credentials - they're the keys to everything!",
            "When logging in, always verify you're on the official site.",
            "Your password security keeps our entire organization safe.",
            "Stay alert and verify before you authenticate!",
        ]
    },
    'brute_force': {
        'intros': [
            "I detected multiple failed login attempts from your session.",
            "You've triggered our brute force detection system.",
            "Multiple rapid login attempts were detected.",
            "Your account showed signs of automated login attempts.",
        ],
        'explanations': [
            "Brute force attacks try thousands of password combinations to break into accounts.",
            "Attackers use automated tools to guess passwords repeatedly until they succeed.",
            "These attacks can compromise accounts with weak or common passwords.",
            "Automated systems can try millions of password combinations per second.",
        ],
        'dangers': [
            "Successful brute force attacks give complete access to your account and data.",
            "Weak passwords can be cracked in minutes, exposing sensitive information.",
            "Once in, attackers can steal data, install malware, or impersonate you.",
            "Compromised accounts can be used to attack other systems and users.",
        ],
        'tips': [
            [
                "Use strong passwords with at least 12 characters",
                "Combine uppercase, lowercase, numbers, and special symbols",
                "Enable account lockout after failed login attempts",
                "Implement multi-factor authentication immediately"
            ],
            [
                "Never use common passwords like 'password123' or 'admin'",
                "Use a password manager to generate and store complex passwords",
                "Monitor login attempts and enable alerts for suspicious activity",
                "Change passwords regularly, especially for critical accounts"
            ],
            [
                "Avoid using personal information in passwords",
                "Use different passwords for different accounts",
                "Enable CAPTCHA to prevent automated login attempts",
                "Report unusual login activity to security team"
            ]
        ],
        'conclusions': [
            "Strong passwords are your first line of defense!",
            "Make your passwords impossible to guess.",
            "Security starts with a strong, unique password.",
            "Protect your accounts with robust authentication!",
        ]
    },
    'xss': {
        'intros': [
            "You just executed untrusted code in your browser.",
            "I detected a cross-site scripting vulnerability in your action.",
            "You've triggered an XSS simulation.",
            "That input you entered could execute malicious scripts.",
        ],
        'explanations': [
            "Cross-site scripting allows attackers to inject malicious code into web pages.",
            "XSS attacks can steal cookies, session tokens, and sensitive information.",
            "Malicious scripts can hijack your browser and perform actions on your behalf.",
            "These vulnerabilities let attackers execute code in other users' browsers.",
        ],
        'dangers': [
            "XSS can steal your session, redirect you to malicious sites, or capture keystrokes.",
            "Attackers can access your cookies, tokens, and personal data through XSS.",
            "Malicious scripts can modify page content, steal credentials, or spread malware.",
            "Your browser can become a tool for attacking other users and systems.",
        ],
        'tips': [
            [
                "Never trust user input - always validate and sanitize",
                "Use Content Security Policy headers to prevent script injection",
                "Encode output data to prevent script execution",
                "Keep your browser and plugins updated"
            ],
            [
                "Be cautious with URLs containing suspicious parameters",
                "Report any unusual behavior or unexpected scripts",
                "Use browser extensions that block malicious scripts",
                "Avoid clicking on untrusted links with strange parameters"
            ],
            [
                "Clear cookies and cache regularly",
                "Use browser security features and extensions",
                "Be wary of forms that don't validate input properly",
                "Report security vulnerabilities to the development team"
            ]
        ],
        'conclusions': [
            "Input validation saves lives - and data!",
            "Stay safe by questioning every input and output.",
            "Secure coding practices protect everyone.",
            "Be vigilant about what code runs in your browser!",
        ]
    },
    'general': {
        'intros': [
            "I noticed you made a security mistake in that simulation.",
            "You've just encountered a common cybersecurity pitfall.",
            "That action you took wasn't secure.",
            "Let me explain what went wrong in that scenario.",
        ],
        'explanations': [
            "Cybersecurity threats come in many forms and can catch anyone off guard.",
            "Attackers constantly evolve their tactics to exploit human behavior.",
            "Security awareness is crucial in protecting against modern threats.",
            "Understanding attack patterns helps you recognize and avoid them.",
        ],
        'dangers': [
            "Security mistakes can lead to data breaches, financial loss, and system compromise.",
            "One small error can have cascading effects across the entire organization.",
            "Cyber attacks can result in stolen data, ransomware, and operational disruption.",
            "The consequences of security breaches extend beyond just technology.",
        ],
        'tips': [
            [
                "Always verify before you trust",
                "Think critically about unexpected requests",
                "Report suspicious activity immediately",
                "Stay informed about latest security threats"
            ],
            [
                "Use strong, unique passwords for all accounts",
                "Enable multi-factor authentication everywhere",
                "Keep software and systems updated",
                "Be skeptical of urgent or unusual requests"
            ],
            [
                "Follow your organization's security policies",
                "Attend regular security training sessions",
                "Ask questions when something seems off",
                "Make security a daily habit, not an afterthought"
            ]
        ],
        'conclusions': [
            "Stay alert and stay secure!",
            "Your vigilance protects everyone.",
            "Security is a shared responsibility.",
            "Together, we build a stronger defense!",
        ]
    },
    'positive_reinforcement': {
        'intros': [
            "Excellent work! You correctly identified the threat.",
            "Great job spotting that suspicious email.",
            "You made the right call - that was definitely a simulation.",
            "Perfect! You handled that scenario exactly right.",
        ],
        'explanations': [
            "By verifying the sender and content, you protected the organization.",
            "Your vigilance is exactly what we need to stay secure.",
            "Recognizing these signs is the key to preventing cyber attacks.",
            "You successfully identified the red flags in that message.",
        ],
        'dangers': [
            "Had you clicked, it could have compromised our systems.",
            "Phishing attacks rely on users letting their guard down.",
            "Many people fall for these, but you stayed sharp.",
            "Your action prevented a potential security breach.",
        ],
        'tips': [
            [
                "Continue to hover over links to verify URLs",
                "Keep checking sender addresses carefully",
                "Maintain your skepticism of urgent requests",
                "Share your knowledge with colleagues"
            ],
            [
                "Your quick thinking saved the day",
                "Reporting suspicious emails helps everyone",
                "Consistency is key to cybersecurity",
                "You're setting a great example for the team"
            ]
        ],
        'conclusions': [
            "Keep up the great work!",
            "Stay vigilant and stay secure.",
            "You're a cybersecurity champion!",
            "Continue to be our first line of defense.",
        ]
    }
}

# Avatar/animation configurations
AVATARS = [
    {
        'id': 'cyber_guardian',
        'name': 'Cyber Guardian',
        'color': '#00d4ff',
        'icon': '🛡️',
        'animation': 'pulse'
    },
    {
        'id': 'security_sentinel',
        'name': 'Security Sentinel',
        'color': '#ff6b6b',
        'icon': '🔒',
        'animation': 'bounce'
    },
    {
        'id': 'ai_advisor',
        'name': 'AI Advisor',
        'color': '#4ecdc4',
        'icon': '🤖',
        'animation': 'wave'
    },
    {
        'id': 'threat_hunter',
        'name': 'Threat Hunter',
        'color': '#ffd93d',
        'icon': '🎯',
        'animation': 'spin'
    }
]

def generate_awareness_script(simulation_type, user_action, difficulty='medium', user_name=None):
    """
    Generate a unique, dynamic awareness script based on simulation context.
    
    Args:
        simulation_type: Type of simulation (phishing, credential_submit, brute_force, xss, general)
        user_action: Specific action the user took
        difficulty: Difficulty level of the simulation
        user_name: Optional user name for personalization
    
    Returns:
        dict: Generated script with text, metadata, and configuration
    """
    
    # Select templates based on user action (success vs failure)
    if user_action == 'correct_identification':
        templates = SCRIPT_TEMPLATES['positive_reinforcement']
    else:
        # Get templates for this simulation type, fallback to general
        templates = SCRIPT_TEMPLATES.get(simulation_type, SCRIPT_TEMPLATES['general'])
    
    # Randomly select components
    intro = random.choice(templates['intros'])
    explanation = random.choice(templates['explanations'])
    danger = random.choice(templates['dangers'])
    tips_set = random.choice(templates['tips'])
    conclusion = random.choice(templates['conclusions'])
    
    # Select 2-3 tips randomly
    num_tips = random.randint(2, 3)
    selected_tips = random.sample(tips_set, num_tips)
    
    # Build the script
    script_parts = [
        f"{intro}",
        "",
        explanation,
        "",
        danger,
        "",
        "Here's what you should do:",
    ]
    
    # Add numbered tips
    for i, tip in enumerate(selected_tips, 1):
        script_parts.append(f"{i}. {tip}")
    
    script_parts.append("")
    script_parts.append(conclusion)
    
    # Join into final script
    script_text = "\n".join(script_parts)
    
    # Select random avatar
    avatar = random.choice(AVATARS)
    
    # Calculate estimated duration (rough estimate: 150 words per minute)
    word_count = len(script_text.split())
    estimated_duration = (word_count / 150) * 60  # in seconds
    
    return {
        'script_text': script_text,
        'avatar': avatar,
        'simulation_type': simulation_type,
        'difficulty': difficulty,
        'estimated_duration': round(estimated_duration, 1),
        'word_count': word_count,
        'generated_at': datetime.utcnow().isoformat(),
        'tips_count': len(selected_tips)
    }


@bp.route('/awareness', methods=['POST'])
def generate_awareness_video():
    """
    Generate AI awareness video content based on user's simulation failure.
    
    Expected payload:
    {
        "user_id": 1,
        "simulation_type": "phishing",
        "user_action": "clicked_link",
        "difficulty": "medium",
        "user_name": "John"
    }
    """
    try:
        data = request.get_json() or {}
        
        user_id = data.get('user_id')
        simulation_type = data.get('simulation_type', 'general')
        user_action = data.get('user_action', 'unknown')
        difficulty = data.get('difficulty', 'medium')
        user_name = data.get('user_name')
        
        # Generate the awareness script
        script_data = generate_awareness_script(
            simulation_type=simulation_type,
            user_action=user_action,
            difficulty=difficulty,
            user_name=user_name
        )
        
        # Add user-specific metadata
        script_data['user_id'] = user_id
        script_data['user_action'] = user_action
        
        return jsonify({
            'success': True,
            **script_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@bp.route('/awareness/video', methods=['GET'])
def get_awareness_video():
    """
    Get awareness video content (alternative GET endpoint for compatibility).
    Query params: user_id, topic (simulation_type)
    """
    try:
        user_id = request.args.get('user_id', type=int)
        topic = request.args.get('topic', 'general')
        
        # Map topic to simulation_type
        simulation_type = topic if topic in SCRIPT_TEMPLATES else 'general'
        
        # Generate script
        script_data = generate_awareness_script(
            simulation_type=simulation_type,
            user_action='general',
            difficulty='medium'
        )
        
        script_data['user_id'] = user_id
        
        return jsonify({
            'success': True,
            **script_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@bp.route('/awareness/topics', methods=['GET'])
def get_available_topics():
    """Get list of available awareness video topics."""
    topics = [
        {
            'id': key,
            'name': key.replace('_', ' ').title(),
            'description': f"Learn about {key.replace('_', ' ')} attacks and how to prevent them"
        }
        for key in SCRIPT_TEMPLATES.keys()
    ]
    
    return jsonify({
        'success': True,
        'topics': topics
    })

@bp.route('/debug/templates', methods=['GET'])
def debug_templates():
    return jsonify(list(SCRIPT_TEMPLATES.keys()))
