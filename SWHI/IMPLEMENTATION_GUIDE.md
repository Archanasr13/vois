# 🚀 Quick Implementation Guide - AI Threat Detection

## Phase 1: AI-Powered Threat Detection (Week 1-2)

This is the **MOST IMPACTFUL** enhancement that will immediately make your project unique. Let's implement it step-by-step.

---

## 📋 Prerequisites

### 1. Install Required Packages
```bash
cd backend
pip install scikit-learn==1.3.0
pip install pandas==2.0.3
pip install numpy==1.24.3
pip install joblib==1.3.2
```

### 2. Update requirements.txt
Add these lines:
```
scikit-learn==1.3.0
pandas==2.0.3
numpy==1.24.3
joblib==1.3.2
```

---

## 📁 Step 1: Create ML Module Structure

Create new directory and files:

```bash
cd backend
mkdir ml
cd ml
```

Create these files:
- `__init__.py`
- `feature_extractor.py`
- `model_trainer.py`
- `predictor.py`
- `data_collector.py`

---

## 🔧 Step 2: Feature Extraction

**File: `backend/ml/feature_extractor.py`**

```python
"""
Feature Extractor for ML-based Threat Detection
Extracts numerical features from domain analysis data
"""

import re
from datetime import datetime
from urllib.parse import urlparse

class FeatureExtractor:
    """Extract features from domain analysis for ML model"""
    
    def __init__(self):
        # Suspicious TLDs (top-level domains)
        self.suspicious_tlds = [
            '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', 
            '.work', '.click', '.link', '.download', '.racing'
        ]
        
        # Trusted hosting providers
        self.trusted_providers = [
            'amazon', 'google', 'microsoft', 'cloudflare', 
            'digitalocean', 'linode', 'vultr'
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
        phishing_keywords = ['login', 'verify', 'account', 'secure', 'update', 'confirm']
        features['has_phishing_keyword'] = int(any(
            keyword in domain.lower() for keyword in phishing_keywords
        ))
        
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
        
        # Is Let's Encrypt (free SSL)
        issuer = str(ssl_info.get('issuer', {})).lower()
        features['is_lets_encrypt'] = int('let\'s encrypt' in issuer or 'letsencrypt' in issuer)
        
        return features
    
    def _extract_ip_features(self, ip_info):
        """Extract features from IP information"""
        features = {}
        
        # Is private IP
        features['is_private_ip'] = int(ip_info.get('is_private', False))
        
        # Has geolocation data
        geo = ip_info.get('geolocation', {})
        features['has_geolocation'] = int(bool(geo.get('country')))
        
        # Country risk score (simplified)
        high_risk_countries = ['CN', 'RU', 'KP', 'IR']  # Example
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
                if isinstance(whois_info['creation_date'], str):
                    creation = datetime.fromisoformat(
                        whois_info['creation_date'].replace('Z', '+00:00')
                    )
                else:
                    creation = whois_info['creation_date']
                
                domain_age_days = (datetime.utcnow() - creation.replace(tzinfo=None)).days
                features['domain_age_days'] = max(domain_age_days, 0)
            except:
                features['domain_age_days'] = 0
        else:
            features['domain_age_days'] = 0
        
        # Has privacy protection
        registrar = str(whois_info.get('registrar', '')).lower()
        features['has_privacy_protection'] = int(
            'privacy' in registrar or 'protected' in registrar
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
        
        # Average subdomain length
        if subdomains:
            avg_length = sum(len(s) for s in subdomains) / len(subdomains)
            features['avg_subdomain_length'] = avg_length
        else:
            features['avg_subdomain_length'] = 0
        
        return features
    
    def _calculate_entropy(self, string):
        """Calculate Shannon entropy of a string"""
        import math
        from collections import Counter
        
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
            # Domain features
            'domain_length', 'dot_count', 'hyphen_count', 'digit_count',
            'has_suspicious_tld', 'domain_entropy', 'has_ip_in_domain',
            'vowel_consonant_ratio', 'has_phishing_keyword',
            
            # DNS features
            'a_record_count', 'mx_record_count', 'ns_record_count',
            'txt_record_count', 'has_ipv6', 'has_cname', 'total_dns_records',
            
            # SSL features
            'ssl_valid', 'ssl_days_until_expiry', 'has_ssl_error',
            'ssl_san_count', 'is_lets_encrypt',
            
            # IP features
            'is_private_ip', 'has_geolocation', 'high_risk_country',
            'has_asn', 'trusted_hosting',
            
            # CDN features
            'cdn_detected', 'is_cloudflare', 'is_akamai',
            'is_amazon_cdn', 'cdn_bypass_count',
            
            # WHOIS features
            'domain_age_days', 'has_privacy_protection', 'has_registrar',
            'nameserver_count',
            
            # Subdomain features
            'subdomain_count', 'has_many_subdomains', 'avg_subdomain_length'
        ]
```

---

## 🎯 Step 3: Model Training

**File: `backend/ml/model_trainer.py`**

```python
"""
ML Model Trainer for Threat Detection
Trains a Random Forest classifier on domain features
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import json
from datetime import datetime

class ThreatModelTrainer:
    """Train ML model for threat detection"""
    
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.model_metrics = {}
    
    def prepare_training_data(self, analysis_results, labels):
        """
        Prepare training data from analysis results
        
        Args:
            analysis_results: List of domain analysis dictionaries
            labels: List of labels (0=safe, 1=suspicious, 2=malicious)
        
        Returns:
            X: Feature matrix
            y: Label vector
        """
        from .feature_extractor import FeatureExtractor
        
        extractor = FeatureExtractor()
        features_list = []
        
        for analysis in analysis_results:
            features = extractor.extract_features(analysis)
            features_list.append(features)
        
        # Convert to DataFrame
        df = pd.DataFrame(features_list)
        self.feature_names = df.columns.tolist()
        
        X = df.values
        y = np.array(labels)
        
        return X, y
    
    def train_model(self, X, y, test_size=0.2, random_state=42):
        """
        Train Random Forest model
        
        Args:
            X: Feature matrix
            y: Labels
            test_size: Proportion of test data
            random_state: Random seed
        
        Returns:
            Dictionary of metrics
        """
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Train Random Forest
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1
        )
        
        print("Training model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=5)
        
        # Store metrics
        self.model_metrics = {
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'classification_report': classification_report(y_test, y_pred),
            'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
            'feature_importance': self._get_feature_importance(),
            'training_date': datetime.utcnow().isoformat()
        }
        
        print(f"\nModel Performance:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Cross-validation: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        print(f"\nClassification Report:\n{self.model_metrics['classification_report']}")
        
        return self.model_metrics
    
    def _get_feature_importance(self):
        """Get feature importance from trained model"""
        if self.model is None or self.feature_names is None:
            return {}
        
        importances = self.model.feature_importances_
        feature_importance = dict(zip(self.feature_names, importances))
        
        # Sort by importance
        sorted_features = sorted(
            feature_importance.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        return dict(sorted_features[:10])  # Top 10 features
    
    def save_model(self, filepath='ml/threat_model.pkl'):
        """Save trained model to file"""
        if self.model is None:
            raise ValueError("No model to save. Train model first.")
        
        model_data = {
            'model': self.model,
            'feature_names': self.feature_names,
            'metrics': self.model_metrics
        }
        
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath='ml/threat_model.pkl'):
        """Load trained model from file"""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.feature_names = model_data['feature_names']
        self.model_metrics = model_data['metrics']
        
        print(f"Model loaded from {filepath}")
        print(f"Accuracy: {self.model_metrics.get('accuracy', 'N/A')}")
```

---

## 🔮 Step 4: Predictor

**File: `backend/ml/predictor.py`**

```python
"""
Threat Predictor using trained ML model
"""

import joblib
import numpy as np
from .feature_extractor import FeatureExtractor

class ThreatPredictor:
    """Predict threat level using ML model"""
    
    def __init__(self, model_path='ml/threat_model.pkl'):
        self.model_path = model_path
        self.model = None
        self.feature_names = None
        self.extractor = FeatureExtractor()
        self.load_model()
    
    def load_model(self):
        """Load trained model"""
        try:
            model_data = joblib.load(self.model_path)
            self.model = model_data['model']
            self.feature_names = model_data['feature_names']
            print(f"ML model loaded successfully from {self.model_path}")
        except FileNotFoundError:
            print(f"Warning: ML model not found at {self.model_path}")
            print("Run model training first or predictions will not be available.")
            self.model = None
    
    def predict(self, analysis_data):
        """
        Predict threat level for domain analysis
        
        Args:
            analysis_data: Domain analysis dictionary
        
        Returns:
            Dictionary with prediction results
        """
        if self.model is None:
            return {
                'ml_available': False,
                'message': 'ML model not trained yet'
            }
        
        # Extract features
        features = self.extractor.extract_features(analysis_data)
        
        # Convert to array in correct order
        feature_vector = np.array([
            features.get(name, 0) for name in self.feature_names
        ]).reshape(1, -1)
        
        # Predict
        prediction = self.model.predict(feature_vector)[0]
        probabilities = self.model.predict_proba(feature_vector)[0]
        
        # Map prediction to label
        labels = {0: 'safe', 1: 'suspicious', 2: 'malicious'}
        predicted_label = labels.get(prediction, 'unknown')
        
        # Get confidence
        confidence = float(max(probabilities))
        
        # Get top contributing features
        top_features = self._get_top_features(features)
        
        return {
            'ml_available': True,
            'prediction': predicted_label,
            'confidence': confidence,
            'probabilities': {
                'safe': float(probabilities[0]),
                'suspicious': float(probabilities[1]),
                'malicious': float(probabilities[2])
            },
            'top_features': top_features,
            'ml_score': self._calculate_ml_score(probabilities)
        }
    
    def _calculate_ml_score(self, probabilities):
        """Calculate ML-based threat score (0-100)"""
        # Weighted score: suspicious=50, malicious=100
        score = (probabilities[1] * 50) + (probabilities[2] * 100)
        return float(score)
    
    def _get_top_features(self, features, top_n=5):
        """Get top contributing features"""
        if self.model is None:
            return []
        
        # Get feature importances
        importances = self.model.feature_importances_
        
        # Create list of (feature_name, value, importance)
        feature_contributions = []
        for i, name in enumerate(self.feature_names):
            value = features.get(name, 0)
            importance = importances[i]
            contribution = value * importance
            feature_contributions.append({
                'feature': name,
                'value': value,
                'importance': float(importance),
                'contribution': float(contribution)
            })
        
        # Sort by contribution
        feature_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
        
        return feature_contributions[:top_n]
```

---

## 📊 Step 5: Data Collection (for training)

**File: `backend/ml/data_collector.py`**

```python
"""
Collect training data from domain analyses
"""

import json
import os
from datetime import datetime

class TrainingDataCollector:
    """Collect and manage training data"""
    
    def __init__(self, data_file='ml/training_data.json'):
        self.data_file = data_file
        self.data = self._load_data()
    
    def _load_data(self):
        """Load existing training data"""
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r') as f:
                return json.load(f)
        return {'analyses': [], 'labels': []}
    
    def add_sample(self, analysis_data, label):
        """
        Add a labeled sample to training data
        
        Args:
            analysis_data: Domain analysis dictionary
            label: 0=safe, 1=suspicious, 2=malicious
        """
        self.data['analyses'].append(analysis_data)
        self.data['labels'].append(label)
        self._save_data()
    
    def _save_data(self):
        """Save training data to file"""
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        with open(self.data_file, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def get_training_data(self):
        """Get all training data"""
        return self.data['analyses'], self.data['labels']
    
    def get_sample_count(self):
        """Get number of training samples"""
        return len(self.data['analyses'])
    
    def create_initial_dataset(self):
        """Create initial training dataset with known domains"""
        # Safe domains
        safe_domains = [
            'google.com', 'facebook.com', 'amazon.com', 'microsoft.com',
            'apple.com', 'github.com', 'stackoverflow.com', 'wikipedia.org'
        ]
        
        # Suspicious patterns (examples - you'll need real analysis data)
        # These are just placeholders
        print("To create initial dataset:")
        print("1. Analyze known safe domains")
        print("2. Analyze known malicious domains (from threat feeds)")
        print("3. Label each analysis (0=safe, 1=suspicious, 2=malicious)")
        print("4. Use add_sample() to build dataset")
```

---

## 🔗 Step 6: Integrate into Main App

**Update `backend/app.py`:**

Add these imports at the top:
```python
from ml.predictor import ThreatPredictor
```

Initialize predictor after creating app:
```python
# After: analyzer = DomainAnalyzer()
try:
    ml_predictor = ThreatPredictor()
    logger.info("ML predictor loaded successfully")
except Exception as e:
    logger.warning(f"ML predictor not available: {e}")
    ml_predictor = None
```

Update the analyze_domain route to include ML prediction:
```python
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
        
        # ADD ML PREDICTION HERE
        if ml_predictor:
            ml_result = ml_predictor.predict(analysis)
            analysis['ml_prediction'] = ml_result
            
            # Combine traditional score with ML score
            if ml_result.get('ml_available'):
                traditional_score = analysis.get('suspicious_score', 0)
                ml_score = ml_result.get('ml_score', 0)
                # Weighted average: 60% ML, 40% traditional
                analysis['combined_score'] = (ml_score * 0.6) + (traditional_score * 0.4)
        
        # Save to database...
        # (rest of the code remains the same)
```

---

## 🎨 Step 7: Update Frontend

**Create new component: `frontend/src/components/MLPrediction.js`**

```javascript
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const MLPrediction = ({ mlData }) => {
  if (!mlData || !mlData.ml_available) {
    return null;
  }

  const { prediction, confidence, probabilities, top_features } = mlData;

  const getPredictionColor = (pred) => {
    switch(pred) {
      case 'safe': return 'text-green-400';
      case 'suspicious': return 'text-yellow-400';
      case 'malicious': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPredictionIcon = (pred) => {
    switch(pred) {
      case 'safe': return <CheckCircle className="h-6 w-6" />;
      case 'suspicious': return <AlertCircle className="h-6 w-6" />;
      case 'malicious': return <AlertCircle className="h-6 w-6" />;
      default: return <Brain className="h-6 w-6" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 cyber-border rounded-lg">
          <Brain className="h-6 w-6 cyber-text" />
        </div>
        <div>
          <h3 className="text-xl font-bold cyber-text">AI-Powered Prediction</h3>
          <p className="text-gray-400">Machine learning threat assessment</p>
        </div>
      </div>

      {/* Prediction Result */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getPredictionColor(prediction)}`}>
              {getPredictionIcon(prediction)}
            </div>
            <div>
              <div className={`text-2xl font-bold ${getPredictionColor(prediction)} capitalize`}>
                {prediction}
              </div>
              <div className="text-sm text-gray-400">
                Confidence: {(confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Probability Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-400">Safe</span>
              <span className="text-gray-400">{(probabilities.safe * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${probabilities.safe * 100}%` }}
                className="bg-green-400 h-2 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-yellow-400">Suspicious</span>
              <span className="text-gray-400">{(probabilities.suspicious * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${probabilities.suspicious * 100}%` }}
                className="bg-yellow-400 h-2 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-400">Malicious</span>
              <span className="text-gray-400">{(probabilities.malicious * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${probabilities.malicious * 100}%` }}
                className="bg-red-400 h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Contributing Features */}
      {top_features && top_features.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="font-semibold cyber-text mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Top Contributing Factors
          </h4>
          <div className="space-y-2">
            {top_features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 capitalize">
                  {feature.feature.replace(/_/g, ' ')}
                </span>
                <span className="cyber-text font-mono">
                  {feature.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MLPrediction;
```

**Update `frontend/src/App.js`:**

Add import:
```javascript
import MLPrediction from './components/MLPrediction';
```

Add component in results section (after SuspiciousScore):
```javascript
{/* ML Prediction */}
{analysis.ml_prediction && (
  <MLPrediction mlData={analysis.ml_prediction} />
)}
```

---

## 📚 Step 8: Create Initial Training Data

**Create script: `backend/train_model.py`**

```python
"""
Script to train the ML model
Run this after collecting training data
"""

from ml.model_trainer import ThreatModelTrainer
from ml.data_collector import TrainingDataCollector

def main():
    print("=" * 60)
    print("ML Threat Detection Model Training")
    print("=" * 60)
    
    # Load training data
    collector = TrainingDataCollector()
    analyses, labels = collector.get_training_data()
    
    print(f"\nLoaded {len(analyses)} training samples")
    
    if len(analyses) < 10:
        print("\nWARNING: Not enough training data!")
        print("You need at least 30-50 samples for decent accuracy")
        print("\nTo collect data:")
        print("1. Analyze known safe domains (Google, Amazon, etc.)")
        print("2. Analyze known malicious domains (from threat feeds)")
        print("3. Label each analysis and add to training data")
        return
    
    # Train model
    trainer = ThreatModelTrainer()
    X, y = trainer.prepare_training_data(analyses, labels)
    
    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Label distribution: {dict(zip(*np.unique(y, return_counts=True)))}")
    
    # Train
    metrics = trainer.train_model(X, y)
    
    # Save model
    trainer.save_model('ml/threat_model.pkl')
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    print(f"\nModel saved to: ml/threat_model.pkl")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"\nTop 10 Important Features:")
    for feature, importance in list(metrics['feature_importance'].items())[:10]:
        print(f"  {feature}: {importance:.4f}")

if __name__ == '__main__':
    import numpy as np
    main()
```

---

## 🚀 Step 9: Testing & Usage

### 1. Collect Initial Training Data

```python
# In Python shell or script
from app import analyzer
from ml.data_collector import TrainingDataCollector

collector = TrainingDataCollector()

# Analyze and label safe domains
safe_domains = ['google.com', 'github.com', 'stackoverflow.com']
for domain in safe_domains:
    analysis = analyzer.analyze_domain(domain)
    collector.add_sample(analysis, label=0)  # 0 = safe

# Analyze and label suspicious/malicious domains
# (You'll need to find these from threat feeds)
malicious_domains = ['example-phishing-site.tk']  # Replace with real ones
for domain in malicious_domains:
    analysis = analyzer.analyze_domain(domain)
    collector.add_sample(analysis, label=2)  # 2 = malicious

print(f"Collected {collector.get_sample_count()} samples")
```

### 2. Train the Model

```bash
cd backend
python train_model.py
```

### 3. Test Predictions

```bash
# Restart your Flask app
python app.py
```

Test with frontend or curl:
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"domain": "google.com"}'
```

---

## 📊 Expected Results

After implementation, your analysis will include:

```json
{
  "domain": "example.com",
  "suspicious_score": 25.5,
  "ml_prediction": {
    "ml_available": true,
    "prediction": "safe",
    "confidence": 0.87,
    "probabilities": {
      "safe": 0.87,
      "suspicious": 0.10,
      "malicious": 0.03
    },
    "top_features": [
      {"feature": "domain_age_days", "value": 8000, "importance": 0.15},
      {"feature": "ssl_valid", "value": 1, "importance": 0.12},
      ...
    ],
    "ml_score": 6.5
  },
  "combined_score": 14.1
}
```

---

## 🎯 Next Steps

1. **Collect more training data** (aim for 100+ samples)
2. **Fine-tune the model** (adjust hyperparameters)
3. **Add more features** (if needed)
4. **Implement Phase 2** (Threat Intelligence APIs)

---

**This implementation alone will make your project 10x more unique!** 🚀

The ML component demonstrates:
- ✅ Advanced machine learning skills
- ✅ Feature engineering expertise
- ✅ Real-world AI application
- ✅ Production-ready ML integration

Your guide will be impressed! 💪
