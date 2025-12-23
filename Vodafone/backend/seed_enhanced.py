"""Enhanced seed data with realistic simulations and quiz questions."""
from models import db, Simulation, QuizQuestion
import json

def seed_simulations():
    """Create realistic phishing simulations."""
    if Simulation.query.first():
        return
    
    simulations = [
        {
            'email_template': """From: security@company-security.com
To: {user_email}
Subject: URGENT: Your Account Will Be Suspended in 24 Hours

Dear Employee,

We have detected suspicious login attempts on your company account from an unknown location (IP: 192.168.45.23).

To prevent unauthorized access, please verify your identity immediately by clicking the link below:

VERIFY NOW: http://company-security-verify.net/login?id=7x9k2m

⚠️ WARNING: If you don't verify within 24 hours, your account will be permanently suspended.

This is an automated security alert. Do not reply to this email.

IT Security Team
Company Security Department""",
            'difficulty': 'easy',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: noreply@office365-microsoft.com
To: {user_email}
Subject: Action Required: Update Your Microsoft 365 Account

Hi there,

We noticed unusual activity on your Microsoft 365 account. To keep your account secure, we need you to verify your identity.

Please click here to update your account settings:
https://microsoft-365-verify.com/update?id=abc123

If you don't update within 48 hours, we may suspend your account.

Thank you,
Microsoft 365 Security Team""",
            'difficulty': 'medium',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: payroll@company.com
To: {user_email}
Subject: Re: Your Payroll Information Needs Verification

Hello,

I hope this email finds you well. Our payroll department has identified a discrepancy in your direct deposit information that needs immediate attention.

To ensure your next paycheck is processed correctly, please verify your banking details by clicking the link below:

VERIFY BANKING INFO: https://payroll-verify.company.com/update

This must be completed by end of business today.

Best regards,
Payroll Department
Human Resources""",
            'difficulty': 'hard',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: ceo@company.com
To: {user_email}
Subject: Confidential: Q4 Budget Review

Team,

I need your immediate input on the Q4 budget allocations. This is confidential and time-sensitive.

Please review the attached document and provide your feedback:
https://internal-docs.company.com/budget/q4-review

I need this by 5 PM today.

Thanks,
CEO""",
            'difficulty': 'hard',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: support@dropbox.com
To: {user_email}
Subject: Your Dropbox Account is Almost Full

Hi,

Your Dropbox account is 95% full. Upgrade now to get 2TB of storage for just $9.99/month.

Click here to upgrade: https://dropbox-upgrade.com/offer?id=special99

Limited time offer - expires in 24 hours!

Dropbox Team""",
            'difficulty': 'easy',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: it-support@company.com
To: {user_email}
Subject: Required: Software Update Installation

Hello,

This is a mandatory security update that must be installed on your workstation immediately.

Please download and run the installer from:
http://it-updates.company.local/security-patch-v2.1.exe

This update addresses critical security vulnerabilities. Failure to install may result in network access restrictions.

IT Support Team""",
            'difficulty': 'medium',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: amazon@amazon-prime.com
To: {user_email}
Subject: Your Prime Membership Has Expired

Your Amazon Prime membership has expired. Renew now to continue enjoying:
- Free shipping
- Prime Video
- Prime Music

Renew for just $12.99/month: https://amazon-prime-renew.com/offer?id=renew123

Don't miss out!
Amazon Prime Team""",
            'difficulty': 'easy',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: bank@yourbank.com
To: {user_email}
Subject: Security Alert: Unusual Activity Detected

We detected a login attempt from a new device. If this was you, no action is needed.

If this wasn't you, please secure your account immediately:
https://secure-bank-verify.com/account?id=alert789

This is an automated security message. Do not reply.

Bank Security Team""",
            'difficulty': 'medium',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: hr@company.com
To: {user_email}
Subject: Your Benefits Enrollment is Due

Hello,

Your annual benefits enrollment period is ending soon. Please complete your selections by clicking below:

ENROLL NOW: https://benefits-enroll.company.com/2024?id=yourid123

This must be completed by Friday at 5 PM.

HR Benefits Team""",
            'difficulty': 'hard',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: fedex@fedex-delivery.com
To: {user_email}
Subject: Package Delivery Failed - Action Required

Your package delivery was unsuccessful. We need you to confirm your delivery address.

Click here to update: https://fedex-delivery-update.com/confirm?id=del456

Your package will be held for 3 business days.

FedEx Delivery Team""",
            'difficulty': 'easy',
            'correct_action': 'safe',
            'department': None
        },
        {
            'email_template': """From: admin@company.com
To: {user_email}
Subject: Company All-Hands Meeting - Tomorrow 2 PM

Hi Team,

Just a reminder about tomorrow's all-hands meeting at 2 PM in the main conference room.

Agenda:
- Q4 Results
- New Initiatives
- Q&A Session

See you there!

Admin Team""",
            'difficulty': 'hard',
            'correct_action': 'unsafe',
            'department': None
        },
        {
            'email_template': """From: calendar@company.com
To: {user_email}
Subject: Meeting Reminder: Team Standup - Today 10 AM

Reminder: You have a team standup meeting today at 10 AM in Conference Room B.

Agenda items:
- Sprint progress
- Blockers
- Next steps

See you there!

Calendar System""",
            'difficulty': 'hard',
            'correct_action': 'unsafe',
            'department': None
        }
    ]
    
    for sim in simulations:
        simulation = Simulation(
            email_template=sim['email_template'],
            difficulty=sim['difficulty'],
            correct_action=sim['correct_action'],
            department=sim.get('department')
        )
        db.session.add(simulation)
    
    db.session.commit()
    print(f"Seeded {len(simulations)} simulations")


def seed_quiz_questions():
    """Create 10+ realistic cybersecurity quiz questions."""
    if QuizQuestion.query.first():
        return
    
    questions = [
        {
            'question': 'You receive an email from "security@company.com" asking you to click a link to verify your account. The email has poor grammar and the link goes to "company-security-verify.net" instead of your company domain. What should you do?',
            'options': [
                'Click the link to verify your account',
                'Forward the email to IT security and delete it',
                'Reply to the email asking for more information',
                'Ignore it completely without reporting'
            ],
            'correct_option': 1,
            'category': 'phishing',
            'explanation': 'This is a phishing attempt. The suspicious domain and poor grammar are red flags. Always forward suspicious emails to IT security.'
        },
        {
            'question': 'A popup appears on your screen saying "Your computer is infected! Click here to scan now!" What should you do?',
            'options': [
                'Click the popup to scan your computer',
                'Close the browser tab/window immediately',
                'Call the number shown in the popup',
                'Download the recommended antivirus software'
            ],
            'correct_option': 1,
            'category': 'malware',
            'explanation': 'This is a common scareware tactic. Close the browser immediately and run a legitimate antivirus scan if concerned.'
        },
        {
            'question': 'You receive a text message from your bank asking you to verify a transaction by clicking a link. What should you do?',
            'options': [
                'Click the link and verify',
                'Call your bank using the number on the back of your card',
                'Reply to the text with your account number',
                'Ignore it if you didn\'t make any transactions'
            ],
            'correct_option': 1,
            'category': 'smishing',
            'explanation': 'Never click links in text messages. Always contact your bank directly using official contact information.'
        },
        {
            'question': 'A colleague emails you asking for your password to access a shared system. What should you do?',
            'options': [
                'Share your password via email',
                'Share your password in person',
                'Never share your password with anyone',
                'Share it if they promise to keep it secret'
            ],
            'correct_option': 2,
            'category': 'password_security',
            'explanation': 'Never share passwords with anyone, even colleagues. Use proper access management systems instead.'
        },
        {
            'question': 'You receive an email from your CEO asking you to purchase gift cards and send the codes immediately. The email seems urgent. What should you do?',
            'options': [
                'Purchase the gift cards immediately',
                'Call your CEO directly to verify the request',
                'Forward the email to IT security',
                'Both B and C'
            ],
            'correct_option': 3,
            'category': 'business_email_compromise',
            'explanation': 'This is a common CEO fraud/BEC attack. Always verify unusual requests through a separate communication channel.'
        },
        {
            'question': 'You notice a USB drive on your desk with a label "Q4 Budget - Confidential". What should you do?',
            'options': [
                'Plug it into your computer to see what\'s on it',
                'Give it to IT security immediately',
                'Throw it away',
                'Ask around to see who left it'
            ],
            'correct_option': 1,
            'category': 'physical_security',
            'explanation': 'Unknown USB devices can contain malware. Always hand them to IT security for safe handling.'
        },
        {
            'question': 'You receive a phone call from "Microsoft Support" saying your computer has a virus and they need remote access to fix it. What should you do?',
            'options': [
                'Allow them remote access',
                'Hang up and report it to IT',
                'Give them your computer password',
                'Follow their instructions to "fix" the issue'
            ],
            'correct_option': 1,
            'category': 'social_engineering',
            'explanation': 'Legitimate tech support never calls you unsolicited. This is a scam. Hang up and report it.'
        },
        {
            'question': 'You\'re working from a coffee shop and need to access company email. What should you do?',
            'options': [
                'Use the public WiFi without VPN',
                'Use public WiFi with company VPN',
                'Use your mobile hotspot',
                'Both B and C are acceptable'
            ],
            'correct_option': 3,
            'category': 'network_security',
            'explanation': 'Public WiFi is insecure. Always use a VPN or your mobile hotspot when accessing company resources remotely.'
        },
        {
            'question': 'You receive an email with an attachment from an unknown sender. The subject says "Invoice - Payment Required". What should you do?',
            'options': [
                'Open the attachment to see what it is',
                'Delete the email immediately',
                'Forward it to IT security and delete',
                'Reply asking who they are'
            ],
            'correct_option': 2,
            'category': 'email_security',
            'explanation': 'Never open attachments from unknown senders. They often contain malware. Delete and report to IT security.'
        },
        {
            'question': 'Your password for a work account was compromised in a data breach. What should you do?',
            'options': [
                'Change only that password',
                'Change that password and any accounts using the same password',
                'Wait to see if anything happens',
                'Share the news on social media'
            ],
            'correct_option': 1,
            'category': 'password_management',
            'explanation': 'If one password is compromised, change it immediately and change any other accounts using the same password.'
        },
        {
            'question': 'You receive a LinkedIn connection request from someone claiming to be a recruiter. Their profile looks legitimate. They ask you to download a "job application form". What should you do?',
            'options': [
                'Download and fill out the form',
                'Verify their identity through official channels first',
                'Connect and share your resume',
                'Ignore the request'
            ],
            'correct_option': 1,
            'category': 'social_engineering',
            'explanation': 'Always verify recruiter identities through official company channels before downloading anything or sharing information.'
        },
        {
            'question': 'A website asks you to enter your company email and password to "verify your account". The URL shows "http://" instead of "https://". What should you do?',
            'options': [
                'Enter your credentials',
                'Close the website immediately',
                'Check if the site is legitimate first',
                'Use a different password'
            ],
            'correct_option': 1,
            'category': 'web_security',
            'explanation': 'HTTP (not HTTPS) means the connection is not encrypted. Never enter credentials on non-HTTPS sites.'
        }
    ]
    
    for q in questions:
        question = QuizQuestion(
            question=q['question'],
            options=json.dumps(q['options']),
            correct_option=q['correct_option'],
            category=q['category'],
            explanation=q['explanation']
        )
        db.session.add(question)
    
    db.session.commit()
    print(f"Seeded {len(questions)} quiz questions")



