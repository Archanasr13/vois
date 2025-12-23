"""Generate realistic phishing simulations with randomized content."""
import random
from datetime import datetime

class PhishingSimulator:
    """Generates varied, realistic phishing emails for training."""

    SENDER_NAMES = [
        "noreply@company-secure.example.com",
        "alerts@account-security.example.com",
        "verify@trusted-accounts.example.com",
        "support@office365-update.example.com",
    ]

    URGENT_PHRASES = [
        "Immediate action required",
        "Your account has been locked",
        "Confirm your identity now",
        "Verify your account immediately",
        "Urgent: Security alert",
        "Action required within 24 hours",
    ]

    FAKE_URLS = [
        "http://verify-account.example-security.com/login",
        "http://secure-login.office365-update.com/auth",
        "http://account-confirm.company-cloud.com/verify",
        "http://identity-check.trusted-banking.example.com",
    ]

    SCENARIOS = [
        {
            "title": "Suspicious Login Detected",
            "body": "We detected a login attempt from an unfamiliar location. If this wasn't you, please verify your account immediately.",
            "cta": "Verify Account",
            "difficulty": "easy",
        },
        {
            "title": "Your Password Expires Soon",
            "body": "Your corporate password will expire in 24 hours. Please update it now to maintain access.",
            "cta": "Update Password",
            "difficulty": "medium",
        },
        {
            "title": "Confirm Your Identity",
            "body": "For security purposes, we need you to confirm your identity. This should only take a minute.",
            "cta": "Confirm Identity",
            "difficulty": "medium",
        },
        {
            "title": "Account Verification Required",
            "body": "Our security team detected unusual activity. Please verify your account details to prevent lockout.",
            "cta": "Verify Now",
            "difficulty": "hard",
        },
        {
            "title": "Update Your Payment Method",
            "body": "Your payment method on file is expiring. Update it now to continue using our services.",
            "cta": "Update Payment",
            "difficulty": "easy",
        },
    ]

    @classmethod
    def generate(cls, difficulty="medium"):
        """Generate a phishing simulation email.

        Args:
            difficulty: 'easy', 'medium', or 'hard'

        Returns:
            dict with 'subject', 'body', 'fake_button_text', 'fake_url', 'difficulty'
        """
        sender = random.choice(cls.SENDER_NAMES)
        scenario = random.choice(cls.SCENARIOS)
        urgent_phrase = random.choice(cls.URGENT_PHRASES)
        fake_url = random.choice(cls.FAKE_URLS)

        # Build email body with proper formatting
        body_lines = [
            f"From: {sender}",
            f"Date: {datetime.now().strftime('%a, %d %b %Y %H:%M:%S')}",
            f"Subject: {urgent_phrase}: {scenario['title']}",
            "",
            f"Dear User,",
            "",
            f"{urgent_phrase}.",
            "",
            f"{scenario['body']}",
            "",
            f"Click the button below to proceed:",
            f"[{scenario['cta']}]",
            "",
            f"Link: {fake_url}",
            "",
            f"If you did not make this request, please contact our support team immediately.",
            "",
            f"Best regards,",
            f"Security Team"
        ]
        
        body = "\n".join(body_lines)
        
        return {
            "subject": scenario["title"],
            "body": body,
            "fake_button_text": scenario["cta"],
            "fake_url": fake_url,
            "sender": sender,
            "difficulty": difficulty,
        }
