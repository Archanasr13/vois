import React, { useState } from 'react';
import api from '../services/api';

const CertificatePage = ({ user }) => {
  const [loading, setLoading] = useState(false);

  const getCertificate = async () => {
    setLoading(true);
    try {
      const blob = await api.requestCertificate({ name: user?.name || 'Learner', score: 100 });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `certificate_${(user?.name||'user')}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Unable to generate certificate.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-3xl text-white font-bold mb-4">Certificate</h2>
      <p className="text-gray-300 mb-4">Generate a completion certificate for your training.</p>
      <button onClick={getCertificate} className="px-4 py-2 bg-blue-600 rounded text-white">{loading ? 'Generating...' : 'Download Certificate'}</button>
    </div>
  );
};

export default CertificatePage;
