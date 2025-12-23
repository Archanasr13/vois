import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Shield, Zap } from 'lucide-react';

const MLPrediction = ({ mlData }) => {
    if (!mlData || !mlData.ml_available) {
        return null;
    }

    const { prediction, confidence, probabilities, top_features, ml_score } = mlData;

    const getPredictionColor = (pred) => {
        switch (pred) {
            case 'safe': return 'text-green-400';
            case 'suspicious': return 'text-yellow-400';
            case 'malicious': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getPredictionBg = (pred) => {
        switch (pred) {
            case 'safe': return 'bg-green-900/20';
            case 'suspicious': return 'bg-yellow-900/20';
            case 'malicious': return 'bg-red-900/20';
            default: return 'bg-gray-900/20';
        }
    };

    const getPredictionIcon = (pred) => {
        switch (pred) {
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
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 cyber-border rounded-lg cyber-glow">
                    <Brain className="h-6 w-6 cyber-text" />
                </div>
                <div>
                    <h3 className="text-xl font-bold cyber-text flex items-center">
                        AI-Powered Prediction
                        <Zap className="h-4 w-4 ml-2 text-yellow-400" />
                    </h3>
                    <p className="text-gray-400">Machine learning threat assessment</p>
                </div>
            </div>

            {/* Main Prediction */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${getPredictionBg(prediction)}`}>
                            <div className={getPredictionColor(prediction)}>
                                {getPredictionIcon(prediction)}
                            </div>
                        </div>
                        <div>
                            <div className={`text-2xl font-bold ${getPredictionColor(prediction)} capitalize`}>
                                {prediction}
                            </div>
                            <div className="text-sm text-gray-400">
                                AI Confidence: {(confidence * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">ML Score</div>
                        <div className={`text-3xl font-bold ${getPredictionColor(prediction)}`}>
                            {ml_score.toFixed(1)}
                        </div>
                    </div>
                </div>

                {/* Probability Bars */}
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-400 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Safe
                            </span>
                            <span className="text-gray-400 font-mono">
                                {(probabilities.safe * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${probabilities.safe * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-green-400 h-2.5 rounded-full"
                                style={{
                                    boxShadow: probabilities.safe > 0.5 ? '0 0 10px rgba(74, 222, 128, 0.5)' : 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-yellow-400 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Suspicious
                            </span>
                            <span className="text-gray-400 font-mono">
                                {(probabilities.suspicious * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${probabilities.suspicious * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                className="bg-yellow-400 h-2.5 rounded-full"
                                style={{
                                    boxShadow: probabilities.suspicious > 0.5 ? '0 0 10px rgba(250, 204, 21, 0.5)' : 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-red-400 flex items-center">
                                <Shield className="h-3 w-3 mr-1" />
                                Malicious
                            </span>
                            <span className="text-gray-400 font-mono">
                                {(probabilities.malicious * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${probabilities.malicious * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                className="bg-red-400 h-2.5 rounded-full"
                                style={{
                                    boxShadow: probabilities.malicious > 0.5 ? '0 0 10px rgba(248, 113, 113, 0.5)' : 'none'
                                }}
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
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full"></div>
                                    <span className="text-sm text-gray-300 capitalize">
                                        {feature.feature.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs text-gray-500">
                                        Impact: {(feature.importance * 100).toFixed(1)}%
                                    </span>
                                    <span className="cyber-text font-mono text-sm font-semibold">
                                        {typeof feature.value === 'number' ? feature.value.toFixed(2) : feature.value}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Badge */}
            <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <Brain className="h-3 w-3" />
                    <span>Powered by Machine Learning • Random Forest Classifier</span>
                </div>
            </div>
        </motion.div>
    );
};

export default MLPrediction;
