import React, { useState } from 'react';
import API from '../services/api';

const CertificateDownload = ({ user }) => {
  const [eligible, setEligible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  React.useEffect(() => {
    checkEligibility();
  }, [user?.id]);

  const checkEligibility = async () => {
    try {
      const data = await API.checkCertificateEligibility({ user_id: user?.id });
      setEligible(data);
    } catch (err) {
      console.error('Failed to check eligibility:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await API.requestCertificate({ user_id: user?.id, name: user?.name });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${user?.name?.replace(' ', '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download certificate: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Checking eligibility...</div>;
  }

  if (!eligible) {
    return <div className="text-gray-400">Unable to check certificate eligibility.</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="font-semibold text-white mb-2">Completion Certificate</h3>
      <p className="text-sm text-gray-400 mb-4">{eligible.message}</p>
      
      {eligible.eligible ? (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
        >
          {downloading ? 'Downloading...' : 'Download Certificate'}
        </button>
      ) : (
        <div className="text-sm text-gray-400">
          <p>Quizzes completed: {eligible.quiz_count}/{eligible.required_quizzes}</p>
          <p>Simulations completed: {eligible.simulation_count}/{eligible.required_simulations}</p>
        </div>
      )}
    </div>
  );
};

export default CertificateDownload;
