import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdaptiveQuiz = ({ user }) => {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.requestAIQuiz({ user_id: user?.id, num_questions: 5 });
        setQuiz(res.quiz || []);
      } catch (e) { console.error(e); }
    };
    load();
  }, [user]);

  const handleChange = (qidx, choiceId) => {
    setAnswers(prev => ({ ...prev, [qidx]: choiceId }));
  };

  const submit = () => {
    // simple grading client-side using returned correct_choice_id
    let correct = 0;
    quiz.forEach((q, idx) => {
      const ans = answers[idx];
      if (ans != null && ans === q.correct_choice_id) correct++;
    });
    setResult({ correct, total: quiz.length });
  };

  return (
    <div>
      <h2 className="text-2xl text-white font-bold mb-4">Adaptive Quiz</h2>
      <div className="space-y-4">
        {quiz.map((q, i) => (
          <div key={q.id} className="bg-white/5 p-3 rounded">
            <div className="text-white mb-2">{i+1}. {q.question}</div>
            <div className="flex flex-col">
              {q.choices.map((c) => (
                <label key={c.id} className="text-gray-300">
                  <input type="radio" name={`q-${i}`} onChange={() => handleChange(i, c.id)} /> {c.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button onClick={submit} className="px-4 py-2 bg-blue-600 rounded text-white">Submit</button>
      </div>
      {result && <div className="mt-4 text-gray-300">Score: {result.correct} / {result.total}</div>}
    </div>
  );
};

export default AdaptiveQuiz;
