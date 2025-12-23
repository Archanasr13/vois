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
            try:
                with open(self.data_file, 'r') as f:
                    return json.load(f)
            except:
                return {'analyses': [], 'labels': [], 'metadata': []}
        return {'analyses': [], 'labels': [], 'metadata': []}
    
    def add_sample(self, analysis_data, label, notes=''):
        """
        Add a labeled sample to training data
        
        Args:
            analysis_data: Domain analysis dictionary
            label: 0=safe, 1=suspicious, 2=malicious
            notes: Optional notes about this sample
        """
        self.data['analyses'].append(analysis_data)
        self.data['labels'].append(label)
        self.data['metadata'].append({
            'domain': analysis_data.get('domain', 'unknown'),
            'timestamp': datetime.utcnow().isoformat(),
            'label': label,
            'notes': notes
        })
        self._save_data()
        print(f"Added sample: {analysis_data.get('domain', 'unknown')} (label={label})")
    
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
    
    def get_label_distribution(self):
        """Get distribution of labels"""
        from collections import Counter
        return dict(Counter(self.data['labels']))
    
    def export_summary(self):
        """Export summary of training data"""
        summary = {
            'total_samples': self.get_sample_count(),
            'label_distribution': self.get_label_distribution(),
            'domains': [m['domain'] for m in self.data.get('metadata', [])],
            'last_updated': datetime.utcnow().isoformat()
        }
        return summary
