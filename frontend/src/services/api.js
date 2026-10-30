const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
async function request(path, options={}) {
  const res = await fetch(`${BASE}${path}`, { headers:{'Content-Type':'application/json'}, ...options });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
export const api = {
  expenses:(params={})=>request('/expenses?' + new URLSearchParams(params)),
  create:(body)=>request('/expenses',{method:'POST',body:JSON.stringify(body)}),
  update:(id,body)=>request(`/expenses/${id}`,{method:'PUT',body:JSON.stringify(body)}),
  remove:(id)=>request(`/expenses/${id}`,{method:'DELETE'}),
  summary:()=>request('/analytics/summary'),
  categories:()=>request('/analytics/categories'),
  monthly:()=>request('/analytics/monthly'),
  payments:()=>request('/analytics/payment-methods'),
  merchants:()=>request('/analytics/top-merchants'),
  trends:()=>request('/analytics/trends')
};
