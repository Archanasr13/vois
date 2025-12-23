import React, { useEffect, useState, useRef } from 'react';

const AwarenessVideo = ({ script, onComplete, isVisible }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [scene, setScene] = useState(0); // 0: intro, 1: attack, 2: danger, 3: solution
  const speechRef = useRef(null);

  useEffect(() => {
    if (isVisible && script) {
      startVideo();
    }
  }, [isVisible, script]);

  const startVideo = () => {
    if (!window.speechSynthesis) {
      onComplete();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      typeWriterEffect(script);
      animateScenes();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setTimeout(onComplete, 2000);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      onComplete();
    };

    speechRef.current = utterance;
    setTimeout(() => window.speechSynthesis.speak(utterance), 100);
  };

  const animateScenes = () => {
    setTimeout(() => setScene(1), 2000);   // Attack scene
    setTimeout(() => setScene(2), 6000);   // Danger scene
    setTimeout(() => setScene(3), 10000);  // Solution scene
  };

  const stopVideo = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setDisplayedText('');
  };

  const typeWriterEffect = (text) => {
    let i = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 35);
  };

  if (!isVisible && !isSpeaking && !displayedText) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(180deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%)',
        zIndex: 9999
      }}
    >
      {/* Animated Scene Container */}
      <div className="relative w-full max-w-4xl h-96 mb-8 bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Scene 0: Introduction - Character appears */}
        {scene === 0 && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-sky-100">
            {/* Happy User Character */}
            <div className="animate-bounce-in">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Head */}
                <circle cx="100" cy="80" r="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
                {/* Happy Eyes */}
                <circle cx="90" cy="75" r="5" fill="#000" className="animate-blink" />
                <circle cx="110" cy="75" r="5" fill="#000" className="animate-blink" />
                {/* Smile */}
                <path d="M 85 90 Q 100 100 115 90" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Body */}
                <rect x="75" y="120" width="50" height="60" rx="10" fill="#3b82f6" />
                {/* Arms - waving */}
                <line x1="75" y1="130" x2="50" y2="110" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" className="animate-wave" />
                <line x1="125" y1="130" x2="150" y2="110" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" className="animate-wave-reverse" />
              </svg>
              <p className="text-center text-2xl font-bold text-gray-800 mt-4 animate-pulse">👤 You</p>
            </div>
          </div>
        )}

        {/* Scene 1: Phishing Email Attack */}
        {scene === 1 && (
          <div className="w-full h-full flex items-center justify-around bg-gradient-to-b from-red-100 to-orange-100 p-8">
            {/* User Character - worried */}
            <div className="animate-slide-in-left">
              <svg width="150" height="150" viewBox="0 0 200 200">
                <circle cx="100" cy="80" r="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
                {/* Worried eyes */}
                <circle cx="90" cy="75" r="5" fill="#000" />
                <circle cx="110" cy="75" r="5" fill="#000" />
                <path d="M 85 95 Q 100 90 115 95" stroke="#000" strokeWidth="3" fill="none" />
                <rect x="75" y="120" width="50" height="60" rx="10" fill="#3b82f6" />
                {/* Sweat drop */}
                <circle cx="70" cy="70" r="4" fill="#60a5fa" className="animate-drip" />
              </svg>
            </div>

            {/* Evil Email Character */}
            <div className="animate-slide-in-right">
              <svg width="180" height="180" viewBox="0 0 200 200" className="animate-shake">
                {/* Email envelope - evil */}
                <rect x="30" y="60" width="140" height="100" rx="10" fill="#ef4444" stroke="#991b1b" strokeWidth="3" />
                <path d="M 30 60 L 100 120 L 170 60" fill="#dc2626" stroke="#991b1b" strokeWidth="3" />
                {/* Evil eyes */}
                <circle cx="70" cy="100" r="8" fill="#000" />
                <circle cx="130" cy="100" r="8" fill="#000" />
                <circle cx="72" cy="98" r="3" fill="#fff" />
                <circle cx="132" cy="98" r="3" fill="#fff" />
                {/* Evil grin */}
                <path d="M 70 130 Q 100 145 130 130" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Horns */}
                <path d="M 50 50 L 60 30 L 70 50" fill="#991b1b" />
                <path d="M 130 50 L 140 30 L 150 50" fill="#991b1b" />
              </svg>
              <p className="text-center text-xl font-bold text-red-600 animate-pulse">📧 Phishing Email!</p>
            </div>

            {/* Warning symbols */}
            <div className="absolute top-4 right-4 text-6xl animate-bounce">⚠️</div>
            <div className="absolute bottom-4 left-4 text-5xl animate-spin-slow">🚨</div>
          </div>
        )}

        {/* Scene 2: Danger - Data Theft */}
        {scene === 2 && (
          <div className="w-full h-full flex items-center justify-around bg-gradient-to-b from-gray-800 to-gray-900 p-8">
            {/* Sad User - data stolen */}
            <div className="animate-shake">
              <svg width="150" height="150" viewBox="0 0 200 200">
                <circle cx="100" cy="80" r="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
                {/* Sad eyes */}
                <circle cx="90" cy="75" r="5" fill="#000" />
                <circle cx="110" cy="75" r="5" fill="#000" />
                <path d="M 85 100 Q 100 90 115 100" stroke="#000" strokeWidth="3" fill="none" />
                {/* Tears */}
                <circle cx="88" cy="85" r="3" fill="#60a5fa" className="animate-drip" />
                <circle cx="112" cy="85" r="3" fill="#60a5fa" className="animate-drip" />
                <rect x="75" y="120" width="50" height="60" rx="10" fill="#3b82f6" />
              </svg>
            </div>

            {/* Hacker Character - stealing data */}
            <div className="animate-float">
              <svg width="180" height="180" viewBox="0 0 200 200">
                {/* Hacker with hoodie */}
                <path d="M 60 40 L 100 20 L 140 40 L 140 100 L 60 100 Z" fill="#1f2937" stroke="#000" strokeWidth="2" />
                {/* Face in shadow */}
                <circle cx="100" cy="70" r="25" fill="#374151" />
                {/* Glowing eyes */}
                <circle cx="90" cy="70" r="5" fill="#22c55e" className="animate-pulse" />
                <circle cx="110" cy="70" r="5" fill="#22c55e" className="animate-pulse" />
                {/* Laptop */}
                <rect x="70" y="110" width="60" height="40" rx="5" fill="#374151" stroke="#000" strokeWidth="2" />
                <rect x="75" y="115" width="50" height="30" fill="#22c55e" opacity="0.3" className="animate-pulse" />
                {/* Stolen data symbols */}
                <text x="85" y="135" fontSize="20" className="animate-blink">💳</text>
                <text x="105" y="135" fontSize="20" className="animate-blink">🔑</text>
              </svg>
              <p className="text-center text-xl font-bold text-red-500 animate-pulse">🦹 Hacker Stealing Data!</p>
            </div>

            {/* Floating stolen data */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-4 animate-float-up">
                <span className="text-4xl">💳</span>
                <span className="text-4xl">🔐</span>
                <span className="text-4xl">📱</span>
              </div>
            </div>
          </div>
        )}

        {/* Scene 3: Solution - Protected User */}
        {scene === 3 && (
          <div className="w-full h-full flex items-center justify-around bg-gradient-to-b from-green-100 to-emerald-100 p-8">
            {/* Happy Protected User */}
            <div className="animate-bounce-in">
              <svg width="150" height="150" viewBox="0 0 200 200">
                <circle cx="100" cy="80" r="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
                {/* Happy eyes */}
                <circle cx="90" cy="75" r="5" fill="#000" />
                <circle cx="110" cy="75" r="5" fill="#000" />
                <path d="M 85 90 Q 100 100 115 90" stroke="#000" strokeWidth="3" fill="none" />
                <rect x="75" y="120" width="50" height="60" rx="10" fill="#3b82f6" />
                {/* Thumbs up */}
                <text x="130" y="140" fontSize="40">👍</text>
              </svg>
            </div>

            {/* Shield Protection */}
            <div className="animate-scale-pulse">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="shield" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <path d="M100 20 L160 50 L160 110 Q160 160 100 180 Q40 160 40 110 L40 50 Z"
                  fill="url(#shield)" stroke="#15803d" strokeWidth="4" />
                <text x="100" y="120" fontSize="70" fill="white" textAnchor="middle">✓</text>
              </svg>
              <p className="text-center text-xl font-bold text-green-600">🛡️ Protected!</p>
            </div>

            {/* Blocked email */}
            <div className="animate-slide-out-right opacity-50">
              <svg width="120" height="120" viewBox="0 0 200 200">
                <rect x="30" y="60" width="140" height="100" rx="10" fill="#ef4444" opacity="0.3" />
                <line x1="40" y1="70" x2="160" y2="150" stroke="#dc2626" strokeWidth="8" />
                <line x1="160" y1="70" x2="40" y2="150" stroke="#dc2626" strokeWidth="8" />
              </svg>
            </div>

            {/* Success sparkles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute text-3xl animate-ping"
                style={{
                  top: Math.random() * 80 + 10 + '%',
                  left: Math.random() * 80 + 10 + '%',
                  animationDelay: i * 0.2 + 's'
                }}
              >✨</div>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in drop-shadow-lg">
        🎓 Security Awareness Training
      </h2>

      {/* Captions */}
      <div
        className="max-w-3xl w-full p-6 rounded-2xl border-2 min-h-[140px] flex items-center justify-center backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#3b82f6',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
        }}
      >
        <p className="text-lg text-gray-800 font-semibold text-center leading-relaxed">
          {displayedText}
          <span className="animate-pulse text-blue-600">|</span>
        </p>
      </div>

      {/* Progress */}
      {isSpeaking && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      )}

      <button
        onClick={() => { stopVideo(); onComplete(); }}
        className="mt-6 px-8 py-3 bg-white text-blue-600 rounded-full text-base font-bold transition-all hover:scale-110 hover:shadow-xl border-2 border-blue-400"
      >
        Skip Video ⏭️
      </button>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-out-right {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-10px) rotate(-5deg); }
          75% { transform: translateX(10px) rotate(5deg); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
        @keyframes wave-reverse {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }
        @keyframes drip {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.8s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 1s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out; }
        .animate-slide-out-right { animation: slide-out-right 1s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
        .animate-wave { animation: wave 1s ease-in-out infinite; transform-origin: top; }
        .animate-wave-reverse { animation: wave-reverse 1s ease-in-out infinite; transform-origin: top; }
        .animate-drip { animation: drip 2s ease-in infinite; }
        .animate-float { animation: float 2s ease-in-out infinite; }
        .animate-float-up { animation: float-up 3s ease-out infinite; }
        .animate-scale-pulse { animation: scale-pulse 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-blink { animation: blink 0.5s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
      `}</style>
    </div>
  );
};

export default AwarenessVideo;
