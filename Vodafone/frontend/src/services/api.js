// API service using axios if available; falls back to fetch when axios is not installed.
// Axios baseURL is intentionally set to http://localhost:5000 to point to the Flask backend.
// Prefer axios when loaded globally (e.g. developer installed it); avoid
// requiring it at build-time to prevent webpack/bundler errors when axios
// isn't present. To enable axios behavior, `npm install axios` and expose
// it on `window.axios` or import it and replace the conditional below.
let axiosInstance = null;
const useAxios = (typeof window !== 'undefined' && window.axios);
if (useAxios) axiosInstance = window.axios.create({ baseURL: 'http://localhost:5000' });

const handleFetchResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    const text = await res.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { message: text || `HTTP ${res.status}` };
    }
    const err = new Error(errorData.message || text || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = errorData;
    throw err;
  }
  if (contentType.includes('application/json')) return res.json();
  if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) return res.blob();
  return res.text();
};

// Helper wrappers
const post = async (path, data) => {
  if (useAxios && axiosInstance) {
    const res = await axiosInstance.post(path, data);
    return res.data;
  }
  const res = await fetch(`http://localhost:5000${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data || {})
  });
  return handleFetchResponse(res);
};

const get = async (path) => {
  if (useAxios && axiosInstance) {
    const res = await axiosInstance.get(path);
    return res.data;
  }
  const res = await fetch(`http://localhost:5000${path}`);
  return handleFetchResponse(res);
};

// Exported API methods
export const authRegister = (payload) => post('/api/auth/register', payload);
export const authLogin = (payload) => post('/api/auth/login', payload);

// Phishing and simulations
export const getPhishingSimulation = (params) => get(`/api/phishing/simulate?${new URLSearchParams(params || {}).toString()}`);
export const trackPhishingClick = (payload) => post('/api/phishing/click', payload);
export const getRandomSimulation = (params) => get(`/api/simulate_attack?${new URLSearchParams(params).toString()}`);
export const submitSimulation = (payload) => post('/api/submit_interaction', payload);

// Risk & health profiles
export const getUserRiskProfile = (userId) => get(`/api/health/user/${userId}`);
export const getOrganizationHealth = () => get('/api/health/organization');

export const getAwarenessContent = (params) => get(`/api/awareness/video?${new URLSearchParams(params).toString()}`);
export const getQuizQuestions = (params) => get(`/api/get_quiz_questions?${new URLSearchParams(params).toString()}`);
export const submitQuiz = (payload) => post('/api/submit_quiz', payload);
export const checkCertificateEligibility = (params) => get(`/api/certificate/check?${new URLSearchParams(params).toString()}`);
export const requestCertificate = async (payload) => {
  // Certificate returns PDF blob, so handle it specially
  const res = await fetch(`http://localhost:5000/api/certificate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.blob();
};
export const getDashboardData = () => get('/api/get_dashboard_data');
export const getUser = (id) => get(`/api/user/${id}`);

export const getAIReport = (params) => post('/api/ai/report', params || {});
export const requestAIQuiz = (payload) => post('/api/ai/quiz', payload);
export const requestAIAwareness = (payload) => post('/api/ai/awareness', payload);

export const healthCheck = () => get('/api/health');

export default { 
  authRegister, 
  authLogin, 
  getPhishingSimulation,
  trackPhishingClick,
  getRandomSimulation, 
  submitSimulation,
  getUserRiskProfile,
  getOrganizationHealth,
  getAwarenessContent,
  getQuizQuestions,
  submitQuiz,
  checkCertificateEligibility,
  requestCertificate, 
  getDashboardData,
  getUser,
  getAIReport, 
  requestAIQuiz, 
  requestAIAwareness, 
  healthCheck 
};
