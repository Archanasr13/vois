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
import os

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
            'training_date': datetime.utcnow().isoformat(),
            'training_samples': len(X_train),
            'test_samples': len(X_test)
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
        
        return dict(sorted_features[:15])  # Top 15 features
    
    def save_model(self, filepath='ml/threat_model.pkl'):
        """Save trained model to file"""
        if self.model is None:
            raise ValueError("No model to save. Train model first.")
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
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
