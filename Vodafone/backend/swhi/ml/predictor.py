"""
Threat Predictor using trained ML model
"""

import joblib
import numpy as np
import os
from .feature_extractor import FeatureExtractor

class ThreatPredictor:
    """Predict threat level using ML model"""
    
    def __init__(self, model_path=None):
        # Determine base directory of this script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        if model_path is None:
            # Default path relative to this script
            self.model_path = os.path.join(base_dir, 'threat_model.pkl')
            # Fallback if the above doesn't exist (e.g. if passed 'ml/threat_model.pkl' formerly)
            if not os.path.exists(self.model_path):
                self.model_path = os.path.join(base_dir, '..', 'ml', 'threat_model.pkl')
        else:
            self.model_path = model_path
            
        self.model = None
        self.feature_names = None
        self.extractor = FeatureExtractor()
        self.load_model()
    
    def load_model(self):
        """Load trained model"""
        try:
            # Try absolute path first
            path_to_try = self.model_path
            if not os.path.isabs(path_to_try):
                path_to_try = os.path.abspath(path_to_try)

            if os.path.exists(path_to_try):
                model_data = joblib.load(path_to_try)
                self.model = model_data['model']
                self.feature_names = model_data['feature_names']
                print(f"ML model loaded successfully from {path_to_try}")
            else:
                # One last attempt: check if it's in the swhi/ml directory from CWD
                fallback = os.path.join(os.getcwd(), 'swhi', 'ml', 'threat_model.pkl')
                if os.path.exists(fallback):
                    model_data = joblib.load(fallback)
                    self.model = model_data['model']
                    self.feature_names = model_data['feature_names']
                    print(f"ML model loaded successfully from fallback: {fallback}")
                else:
                    print(f"Warning: ML model not found at {path_to_try} or {fallback}")
                    self.model = None
        except Exception as e:
            print(f"Error loading ML model: {e}")
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
        
        try:
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
                    'suspicious': float(probabilities[1]) if len(probabilities) > 1 else 0.0,
                    'malicious': float(probabilities[2]) if len(probabilities) > 2 else 0.0
                },
                'top_features': top_features,
                'ml_score': self._calculate_ml_score(probabilities)
            }
        except Exception as e:
            print(f"Error in ML prediction: {e}")
            return {
                'ml_available': False,
                'error': str(e)
            }
    
    def _calculate_ml_score(self, probabilities):
        """Calculate ML-based threat score (0-100)"""
        # Weighted score: suspicious=50, malicious=100
        if len(probabilities) >= 3:
            score = (probabilities[1] * 50) + (probabilities[2] * 100)
        else:
            score = 0
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
                'value': float(value),
                'importance': float(importance),
                'contribution': float(contribution)
            })
        
        # Sort by contribution
        feature_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
        
        return feature_contributions[:top_n]
