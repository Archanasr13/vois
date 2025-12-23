import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SimulationCard from '../components/SimulationCard';
import ResultModal from '../components/ResultModal';

const RoleSimulation = ({ user }) => {
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getRandomSimulation();
      setSim(data);
    } catch (e) {
      console.error(e); setSim(null);
    } finally { setLoading(false); }
  };

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const handleAction = async (action) => {
    try {
      const res = await api.submitSimulation({ user_id: user?.id || 1, simulation_id: sim.id, action_taken: action });
      const isCorrect = res.is_correct === true || res.ok === true;
      setResult({
        isCorrect: isCorrect,
        isSafe: action === 'safe',
        score: res.new_score,
        correctAction: res.correct_action || res.correctAction,
        userAction: action,
        message: isCorrect ? 'Good job — you handled this correctly.' : 'This was unsafe. Please review the tips.'
      });
      setShowResult(true);
    } catch (e) {
      console.error(e);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setResult(null);
    load();
  };

  return (
    <div>
      <h2 className="text-3xl text-white font-bold mb-4">Role-based Simulation</h2>
      <p className="text-gray-300 mb-6">Simulations tailored to common roles (HR, Finance, IT).</p>
      {loading && <div className="text-gray-300">Loading...</div>}
      {!loading && sim && <SimulationCard simulation={sim} onAction={handleAction} />}
      {!loading && !sim && <div className="text-red-400">No simulation available.</div>}

      <ResultModal isOpen={showResult} onClose={closeResult} result={result} type="simulation" />
    </div>
  );
};

export default RoleSimulation;
