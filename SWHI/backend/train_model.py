"""
Script to train the ML model
Run this after collecting training data
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.model_trainer import ThreatModelTrainer
from ml.data_collector import TrainingDataCollector
import numpy as np

def main():
    print("=" * 60)
    print("ML Threat Detection Model Training")
    print("=" * 60)
    
    # Load training data
    collector = TrainingDataCollector()
    analyses, labels = collector.get_training_data()
    
    print(f"\nLoaded {len(analyses)} training samples")
    
    if len(analyses) < 10:
        print("\n⚠️  WARNING: Not enough training data!")
        print("You need at least 30-50 samples for decent accuracy")
        print("\nTo collect data:")
        print("1. Run collect_training_data.py")
        print("2. Or manually analyze domains and label them")
        return
    
    # Show label distribution
    print(f"\nLabel distribution: {collector.get_label_distribution()}")
    
    # Train model
    trainer = ThreatModelTrainer()
    X, y = trainer.prepare_training_data(analyses, labels)
    
    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Number of features: {X.shape[1]}")
    
    # Train
    metrics = trainer.train_model(X, y)
    
    # Save model
    trainer.save_model('ml/threat_model.pkl')
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print(f"\nModel saved to: ml/threat_model.pkl")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Cross-validation: {metrics['cv_mean']:.4f} (+/- {metrics['cv_std']:.4f})")
    print(f"\nTop 10 Important Features:")
    for i, (feature, importance) in enumerate(list(metrics['feature_importance'].items())[:10], 1):
        print(f"  {i}. {feature}: {importance:.4f}")

if __name__ == '__main__':
    main()
