import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AwarenessVideo from '../components/AwarenessVideo';

const AwarenessVideoPage = ({ user }) => {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVideoContent();
    }, []);

    const fetchVideoContent = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/awareness/video', {
                params: {
                    user_id: user?.id || 1,
                    topic: 'phishing'
                }
            });

            if (response.data) {
                setVideoData(response.data);
            }
        } catch (error) {
            console.error('Error fetching video content:', error);
            setError('Failed to load video content. The AI video generation service may not be available.');
        } finally {
            setLoading(false);
        }
    };

    const handleVideoComplete = () => {
        setShowVideo(false);
        // Optionally refresh to get new content
        fetchVideoContent();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="glassmorphism rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading AI-Generated Content...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glassmorphism rounded-xl p-8 max-w-2xl text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <h2 className="text-2xl font-bold text-white mb-4">AI Video Service Unavailable</h2>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            fetchVideoContent();
                        }}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
                    🎬 AI-Generated Awareness Videos
                </h1>
                <p className="text-gray-300 text-lg">
                    Watch personalized cybersecurity training videos powered by AI
                </p>
            </div>

            {showVideo && videoData ? (
                <div className="max-w-6xl mx-auto">
                    <AwarenessVideo
                        script={videoData.script_text || videoData.script}
                        onComplete={handleVideoComplete}
                        isVisible={showVideo}
                    />
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    {/* Video Preview Card */}
                    <div className="glassmorphism rounded-2xl p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-white">Ready to Watch</h2>
                            <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold">
                                AI Generated
                            </span>
                        </div>

                        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 mb-6">
                            <div className="text-center mb-6">
                                <div className="text-8xl mb-4">🎬</div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Personalized Cybersecurity Training
                                </h3>
                                <p className="text-gray-300">
                                    This video has been tailored to your learning needs using advanced AI
                                </p>
                            </div>

                            {videoData && (
                                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                    <div className="text-sm font-semibold text-gray-400 mb-2">Video Preview:</div>
                                    <p className="text-gray-300 text-sm line-clamp-3">
                                        {videoData.script_text || videoData.script || 'AI-generated cybersecurity awareness content'}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowVideo(true)}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                            >
                                ▶️ Start Video
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                <div className="text-3xl mb-2">🤖</div>
                                <div className="text-white font-semibold mb-1">AI-Powered</div>
                                <div className="text-gray-400 text-sm">Generated using advanced AI</div>
                            </div>
                            <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                <div className="text-3xl mb-2">🎯</div>
                                <div className="text-white font-semibold mb-1">Personalized</div>
                                <div className="text-gray-400 text-sm">Tailored to your needs</div>
                            </div>
                            <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                                <div className="text-3xl mb-2">⚡</div>
                                <div className="text-white font-semibold mb-1">Interactive</div>
                                <div className="text-gray-400 text-sm">Engaging animations</div>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="glassmorphism rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">About AI Videos</h3>
                        <div className="space-y-3 text-gray-300">
                            <p>
                                Our AI-generated awareness videos use cutting-edge technology to create personalized
                                cybersecurity training content just for you.
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Animated characters and scenarios</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Real-world threat examples</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Interactive learning experience</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Adaptive content based on your progress</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AwarenessVideoPage;
