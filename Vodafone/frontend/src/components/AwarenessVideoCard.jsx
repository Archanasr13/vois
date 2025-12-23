import React from 'react';

const AwarenessVideoCard = ({ script_text, audio_url, play }) => {
  return (
    <div className="bg-white/5 rounded p-4">
      <h4 className="text-white font-semibold">Personalized Awareness</h4>
      <p className="text-gray-300 mt-2">{script_text}</p>
      {audio_url ? (
        <div className="mt-3">
          <audio controls src={audio_url} className="w-full" />
          <a href={audio_url} download className="text-sm text-blue-400">Download audio</a>
        </div>
      ) : (
        <div className="mt-3">
          <button onClick={() => {
            if ('speechSynthesis' in window) {
              const u = new SpeechSynthesisUtterance(script_text);
              window.speechSynthesis.speak(u);
            }
          }} className="px-3 py-1 bg-green-600 rounded text-white text-sm">Play Guidance (Browser TTS)</button>
        </div>
      )}
    </div>
  );
};

export default AwarenessVideoCard;
