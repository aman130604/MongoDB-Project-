import React, { useCallback, useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  LayoutDashboard, Receipt, BarChart2, Settings,
  Plus, Search, Pencil, Trash2, TrendingUp, Wallet,
  Target, RefreshCw, X, CheckCircle2, AlertCircle,
  Bell, ChevronRight, Layers, Car, Calendar,
  TrendingDown, ArrowUp, ArrowDown, MoreHorizontal
} from 'lucide-react';
import { api } from './services/api';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Healthcare', 'Other'];
const PAYMENTS = ['Cash', 'UPI', 'Credit Card', 'Debit Card'];
const EMPTY_FORM = {
  user_id: 'STU001', amount: '', category: 'Food',
  description: '', payment_method: 'UPI',
  date: new Date().toISOString().slice(0, 10),
  merchant: '', tags: ''
};

/* ─── Chart colours — coral accent + charcoal + grays ───────────────────── */
const C = ['#e8614c', '#111111', '#888888', '#bbbbbb', '#3b82f6', '#f59e0b', '#10b981', '#a855f7'];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const money = n =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const shortDate = d =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const fmtMonth = m => {
  if (!m) return '';
  const [y, mo] = m.split('-');
  return new Date(y, mo - 1).toLocaleDateString('en-IN', { month: 'short' });
};

const catClass = c => ({ 'Food': 'badge-food', 'Transport': 'badge-transport', 'Shopping': 'badge-shopping', 'Bills': 'badge-bills', 'Education': 'badge-education', 'Entertainment': 'badge-entertainment', 'Healthcare': 'badge-healthcare', 'Other': 'badge-other' }[c] || 'badge-other');
const pmtClass = p => ({ 'UPI': 'badge-upi', 'Cash': 'badge-cash', 'Credit Card': 'badge-credit', 'Debit Card': 'badge-debit' }[p] || 'badge-other');

const pct = (val, total) => total ? Math.round((val / total) * 100) : 0;

/* ─── Custom chart tooltip ───────────────────────────────────────────────── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>
      {label && <p style={{ color: '#aaa', marginBottom: 3, fontWeight: 600 }}>{label}</p>}
      <p style={{ fontWeight: 700, color: payload[0]?.color || '#111' }}>{money(payload[0]?.value)}</p>
    </div>
  );
}

/* ─── Toast stack ────────────────────────────────────────────────────────── */
function Toasts({ items }) {
  return (
    <div className="toast-stack">
      {items.map(t => (
        <div key={t.id} className={`toast${t.type === 'error' ? ' error' : ''}`}>
          {t.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─── Skeleton helpers ───────────────────────────────────────────────────── */
function SkCell() {
  return (
    <div className="kpi-cell">
      <div className="kpi-cell-header">
        <div className="sk sk-h14" style={{ width: 100 }} />
        <span className="kpi-dots">···</span>
      </div>
      <div className="sk sk-h36" style={{ width: '60%', marginTop: 6 }} />
      <div className="sk sk-h14" style={{ width: 80 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [cats, setCats] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [pmtData, setPmt] = useState([]);
  const [merchants, setMerch] = useState([]);
  const [trends, setTrends] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: 'All', payment_method: 'All', month: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [delTarget, setDel] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [e, s, c, m, p, me, t] = await Promise.all([
        api.expenses(filters), api.summary(), api.categories(),
        api.monthly(), api.payments(), api.merchants(), api.trends()
      ]);
      setExpenses(e); setSummary(s); setCats(c); setMonthly(m);
      setPmt(p); setMerch(me); setTrends(t);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [filters.category, filters.payment_method, filters.month]);

  useEffect(() => { const x = setTimeout(load, 280); return () => clearTimeout(x); }, [filters.search]);
  useEffect(() => { load(); }, [filters.category, filters.payment_method, filters.month]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const body = { ...form, amount: Number(form.amount), tags: form.tags.split(',').map(x => x.trim()).filter(Boolean) };
      if (editing) { await api.update(editing, body); notify('Expense updated'); }
      else { await api.create(body); notify('Expense added'); }
      setShowForm(false); setForm(EMPTY_FORM); setEditing(null); await load();
    } catch (err) { notify(err.message, 'error'); }
  };

  const openEdit = x => { setEditing(x._id); setForm({ ...x, amount: String(x.amount), tags: (x.tags || []).join(', ') }); setShowForm(true); };
  const openDel = x => { setDel(x); setShowDel(true); };
  const confirmDel = async () => {
    try { await api.remove(delTarget._id); notify('Expense deleted'); setShowDel(false); setDel(null); await load(); }
    catch (err) { notify(err.message, 'error'); }
  };
  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };

  /* sidebar icons only */
  const sideItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, tip: 'Dashboard' },
    { id: 'expenses', icon: <Receipt size={18} />, tip: 'Expenses' },
    { id: 'analytics', icon: <BarChart2 size={18} />, tip: 'Analytics' },
  ];

  /* top tab labels */
  const tabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'expenses', label: 'Transactions' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'add', label: '+ Add Expense', accent: true },
  ];

  return (
    <div className="app">
      {/* ── Icon Sidebar ─────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-mark">₹</div>

        <div className="sidebar-nav">
          {sideItems.map(it => (
            <button
              key={it.id}
              className={`sidebar-btn${tab === it.id ? ' active' : ''}`}
              onClick={() => setTab(it.id)}
              data-tip={it.tip}
              aria-label={it.tip}
              aria-current={tab === it.id ? 'page' : undefined}
            >
              {it.icon}
            </button>
          ))}
          <button className="sidebar-btn" data-tip="Settings" aria-label="Settings" disabled>
            <Settings size={18} />
          </button>
        </div>

        <div className="sidebar-avatar">ST</div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="main">

        {/* Top Bar */}
        <header className="topbar">
          <span className="topbar-logo">Expense Analytics</span>

          {/* Centered pill tabs */}
          <nav className="topbar-nav" aria-label="Main navigation">
            <div className="topbar-tabs">
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`tab-btn${(t.id === 'add' ? showForm : tab === t.id) ? ' active' : ''}`}
                  onClick={() => (t.id === 'add' ? openAdd() : setTab(t.id))}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="topbar-right">
            <button id="refresh-btn" className="topbar-icon-btn" onClick={load} title="Refresh" aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
            <button className="topbar-icon-btn" title="Notifications" aria-label="Notifications">
              <Bell size={14} />
            </button>
            <div className="topbar-user-avatar">ST</div>
          </div>
        </header>

        {/* Page */}
        <div className="page">
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={14} />
              <span>{error} — start MongoDB + Flask backend and refresh.</span>
            </div>
          )}

          {tab === 'dashboard' && (
            <DashboardPage
              summary={summary} cats={cats} monthly={monthly}
              payments={pmtData} trends={trends} merchants={merchants}
              expenses={expenses} loading={loading}
              onAdd={openAdd} onEdit={openEdit} onDelete={openDel}
            />
          )}
          {tab === 'expenses' && (
            <ExpensesPage
              expenses={expenses} filters={filters} setFilters={setFilters}
              loading={loading} onAdd={openAdd} onEdit={openEdit} onDelete={openDel}
            />
          )}
          {tab === 'analytics' && (
            <AnalyticsPage
              summary={summary} cats={cats} monthly={monthly}
              payments={pmtData} trends={trends} merchants={merchants}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <ExpenseModal
          form={form} setForm={setForm} editing={editing}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }}
        />
      )}
      {showDel && delTarget && (
        <DeleteModal expense={delTarget} onConfirm={confirmDel} onClose={() => { setShowDel(false); setDel(null); }} />
      )}

      <Toasts items={toasts} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════════════════════════════════════ */
function DashboardPage({ summary, cats, monthly, payments, trends, merchants, expenses, loading, onAdd, onEdit, onDelete }) {

  const totalCats = cats.reduce((a, b) => a + b.total, 0);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Overview Dashboard</h1>
          <p>{greeting()}, Student </p>
        </div>
        <div className="page-header-right">
          <button className="btn btn-outline btn-sm">
            <Calendar size={13} /> Last 7 Days
          </button>
          <button id="dashboard-add-btn" className="btn btn-primary btn-sm" onClick={onAdd}>
            <Plus size={13} /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="kpi-strip mb14">
        {loading ? [0, 1, 2, 3].map(i => <SkCell key={i} />) : (
          <>
            <KpiCell
              id="kpi-total"
              icon={<Wallet size={15} />}
              label="Total Spending"
              value={money(summary.total)}
              change={null}
            />
            <KpiCell
              id="kpi-count"
              icon={<Receipt size={15} />}
              label="Transactions"
              value={summary.count ?? 0}
              change={null}
            />
            <KpiCell
              id="kpi-avg"
              icon={<TrendingUp size={15} />}
              label="Average Expense"
              value={money(summary.average)}
              change={null}
            />
            <KpiCell
              id="kpi-top"
              icon={<Target size={15} />}
              label="Top Category"
              value={summary.highest_category || '—'}
              change={null}
            />
          </>
        )}
      </div>

      {/* Charts row 1 — bar + donut */}
      <div className="charts-grid mb14">

        {/* Monthly bar */}
        <div className="card">
          <div className="card-head">
            <div>
              <p className="card-title">Transaction Revenue Performance</p>
            </div>
            <button className="card-pill-btn">This Year <ChevronRight size={12} /></button>
          </div>
          <div className="card-body">
            {loading ? <div className="sk sk-chart" /> : (
              <>
                {monthly.length > 0 && (
                  <>
                    <div className="chart-callout">{money(monthly[monthly.length - 1]?.total)}</div>
                    <div className="chart-callout-sub"><ArrowUp size={12} /> from last month</div>
                  </>
                )}
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="28%">
                      <CartesianGrid vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" tickFormatter={fmtMonth} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#aaa' }} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} tick={{ fontSize: 11, fill: '#aaa' }} width={46} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={36}>
                        {monthly.map((_, i) => (
                          <Cell
                            key={i}
                            fill={i === monthly.length - 1 ? '#e8614c' : '#f5c9c3'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment method donut + table */}
        <div className="card">
          <div className="card-head">
            <div>
              <p className="card-title">Payment Method Analytics</p>
            </div>
            <button className="card-pill-btn">This Month <ChevronRight size={12} /></button>
          </div>
          {loading ? (
            <div style={{ padding: '0 18px 18px' }}><div className="sk sk-chart" /></div>
          ) : (
            <div className="donut-layout">
              {/* Donut */}
              <div className="donut-chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={payments} dataKey="total" nameKey="payment_method"
                      innerRadius={60} outerRadius={90} paddingAngle={2} strokeWidth={0}
                    >
                      {payments.map((_, i) => <Cell key={i} fill={[C[1], C[0], C[2], C[3]][i % 4]} />)}
                    </Pie>
                    <Tooltip formatter={v => money(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Table legend */}
              <div className="donut-legend-table">
                <div className="donut-legend-header">
                  <span>Payment Method</span>
                  <span>%</span>
                  <span style={{ textAlign: 'right' }}>Volume</span>
                </div>
                {payments.map((x, i) => (
                  <div className="donut-legend-row" key={x.payment_method}>
                    <div className="donut-legend-name">
                      <div className="donut-legend-dot" style={{ background: [C[1], C[0], C[2], C[3]][i % 4] }} />
                      {x.payment_method}
                    </div>
                    <span className="donut-legend-pct">{pct(x.total, payments.reduce((a, b) => a + b.total, 0))}%</span>
                    <span className="donut-legend-val">{money(x.total)}</span>
                  </div>
                ))}
                {!payments.length && <p style={{ color: '#aaa', fontSize: 12, padding: '16px 0' }}>No data yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 — category donut + quick stats + merchants */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Category donut */}
        <div className="card">
          <div className="card-head">
            <div>
              <p className="card-title">Category Breakdown</p>
            </div>
          </div>
          {loading ? (
            <div style={{ padding: '0 18px 18px' }}><div className="sk sk-chart" style={{ height: 180 }} /></div>
          ) : (
            <div className="donut-layout" style={{ flexDirection: 'column', padding: '0 18px 14px', gap: 10 }}>
              <div style={{ height: 180, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={cats} dataKey="total" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                      {cats.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => money(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gap: 3 }}>
                {cats.slice(0, 5).map((x, i) => (
                  <div key={x.category} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: C[i % C.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#555' }}>{x.category}</span>
                    <span style={{ fontWeight: 700, color: '#111' }}>{pct(x.total, totalCats)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-head">
            <div><p className="card-title">Quick Stats</p></div>
            <button className="btn-ghost" style={{ fontSize: 11, color: '#888' }}>View All</button>
          </div>
          {loading ? (
            <div style={{ padding: '0 18px 14px' }}>{[0, 1, 2, 3, 4].map(i => <div key={i} className="sk sk-h14 mb14" style={{ marginBottom: 12 }} />)}</div>
          ) : (
            <>
              <div className="qs-row"><span className="qs-label">Total Transactions</span><span className="qs-val">{summary.count ?? 0}</span></div>
              <div className="qs-row"><span className="qs-label">Total Spending</span><span className="qs-val">{money(summary.total)}</span></div>
              <div className="qs-row"><span className="qs-label">Average Expense</span><span className="qs-val">{money(summary.average)}</span></div>
              <div className="qs-row"><span className="qs-label">Top Category</span><span className="qs-val">{summary.highest_category || '—'}</span></div>
              <div className="qs-row"><span className="qs-label">Top Merchant</span><span className="qs-val">{merchants[0]?.merchant || '—'}</span></div>
            </>
          )}
        </div>

        {/* Top Merchants */}
        <div className="card">
          <div className="card-head">
            <div><p className="card-title">Top Merchants</p></div>
          </div>
          {loading ? (
            <div style={{ padding: '0 18px 14px' }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}><div className="sk" style={{ width: 28, height: 28, borderRadius: 6 }} /><div style={{ flex: 1 }}><div className="sk sk-h14" style={{ width: '80%', marginBottom: 4 }} /><div className="sk sk-h14" style={{ width: '50%' }} /></div></div>)}</div>
          ) : merchants.length === 0 ? (
            <p style={{ padding: '20px 18px', color: '#aaa', fontSize: 12 }}>No merchant data yet.</p>
          ) : (
            <>
              {merchants.map((m, i) => (
                <div className="merchant-row" key={m.merchant}>
                  <span className="merchant-rank">{String(i + 1).padStart(2, '0')}</span>
                  <div className="merchant-initial">{(m.merchant[0] || '?').toUpperCase()}</div>
                  <div className="merchant-info">
                    <strong>{m.merchant}</strong>
                    <span>{m.transactions} txn{m.transactions !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="merchant-amount">{money(m.total)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-head">
          <div>
            <p className="card-title">Recent Transactions</p>
            <p className="card-subtitle">Latest {Math.min(expenses.length, 6)} entries</p>
          </div>
          <button className="btn-ghost" style={{ fontSize: 11, color: '#888' }}>View All <ChevronRight size={11} /></button>
        </div>
        <TxTable expenses={expenses.slice(0, 6)} loading={loading} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   EXPENSES PAGE
══════════════════════════════════════════════════════════════════════════ */
function ExpensesPage({ expenses, filters, setFilters, loading, onAdd, onEdit, onDelete }) {
  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Expenses</h1>
          <p>Track and manage all your transactions.</p>
        </div>
        <div className="page-header-right">
          <button id="expenses-add-btn" className="btn btn-primary btn-sm" onClick={onAdd}>
            <Plus size={13} /> Add Expense
          </button>
        </div>
      </div>

      <div className="toolbar mb14">
        <div className="toolbar-search">
          <Search size={14} />
          <input
            id="expenses-search"
            type="text"
            placeholder="Search description or merchant…"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select id="expenses-cat-filter" className="toolbar-select" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(x => <option key={x}>{x}</option>)}
        </select>
        <select id="expenses-pmt-filter" className="toolbar-select" value={filters.payment_method} onChange={e => setFilters({ ...filters, payment_method: e.target.value })}>
          <option value="All">All Payments</option>
          {PAYMENTS.map(x => <option key={x}>{x}</option>)}
        </select>
        <input id="expenses-month-filter" type="month" className="toolbar-date" value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} />
        {(filters.search || filters.category !== 'All' || filters.payment_method !== 'All' || filters.month) && (
          <button className="btn btn-outline btn-sm" onClick={() => setFilters({ search: '', category: 'All', payment_method: 'All', month: '' })}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <p className="card-title">All Transactions</p>
            <p className="card-subtitle">{expenses.length} record{expenses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <TxTable expenses={expenses} loading={loading} onEdit={onEdit} onDelete={onDelete} showEmpty />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ANALYTICS PAGE
══════════════════════════════════════════════════════════════════════════ */
function AnalyticsPage({ summary, cats, monthly, payments, trends, merchants, loading }) {
  const totalCats = cats.reduce((a, b) => a + b.total, 0);
  const totalPmt = payments.reduce((a, b) => a + b.total, 0);

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Analytics</h1>
          <p>Understand where your money goes.</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="analytics-kpis">
        {loading ? [0, 1, 2, 3].map(i => (
          <div key={i} className="analytics-kpi-card">
            <div className="sk sk-h14" style={{ width: 90, marginBottom: 6 }} />
            <div className="sk sk-h36" style={{ width: '60%', marginBottom: 6 }} />
            <div className="sk sk-h14" style={{ width: 70 }} />
          </div>
        )) : (
          <>
            <div className="analytics-kpi-card" id="analytics-total">
              <p className="analytics-kpi-label">Total Spending</p>
              <p className="analytics-kpi-value">{money(summary.total)}</p>
              <p className="analytics-kpi-sub">All time cumulative</p>
            </div>
            <div className="analytics-kpi-card" id="analytics-avg">
              <p className="analytics-kpi-label">Avg / Transaction</p>
              <p className="analytics-kpi-value">{money(summary.average)}</p>
              <p className="analytics-kpi-sub">{summary.count || 0} transactions</p>
            </div>
            <div className="analytics-kpi-card" id="analytics-top-cat">
              <p className="analytics-kpi-label">Top Category</p>
              <p className="analytics-kpi-value">{summary.highest_category || '—'}</p>
              <p className="analytics-kpi-sub">Highest cumulative</p>
            </div>
            <div className="analytics-kpi-card" id="analytics-top-merch">
              <p className="analytics-kpi-label">Top Merchant</p>
              <p className="analytics-kpi-value">{merchants[0]?.merchant || '—'}</p>
              <p className="analytics-kpi-sub">{merchants[0] ? money(merchants[0].total) : 'No data'}</p>
            </div>
          </>
        )}
      </div>

      {/* Row 1 */}
      <div className="charts-grid mb14">
        {/* Category donut + table */}
        <div className="card">
          <div className="card-head"><p className="card-title">Category Spending</p></div>
          {loading ? <div style={{ padding: '0 18px 18px' }}><div className="sk sk-chart" /></div> : cats.length === 0 ? <p style={{ padding: '30px', color: '#aaa', fontSize: 12 }}>No data yet.</p> : (
            <div className="donut-layout">
              <div className="donut-chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={cats} dataKey="total" nameKey="category" innerRadius={55} outerRadius={88} paddingAngle={2} strokeWidth={0}>
                      {cats.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => money(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="donut-legend-table">
                <div className="donut-legend-header"><span>Category</span><span>%</span><span style={{ textAlign: 'right' }}>Amount</span></div>
                {cats.map((x, i) => (
                  <div className="donut-legend-row" key={x.category}>
                    <div className="donut-legend-name"><div className="donut-legend-dot" style={{ background: C[i % C.length] }} />{x.category}</div>
                    <span className="donut-legend-pct">{pct(x.total, totalCats)}%</span>
                    <span className="donut-legend-val">{money(x.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment method donut + table */}
        <div className="card">
          <div className="card-head"><p className="card-title">Payment Methods</p></div>
          {loading ? <div style={{ padding: '0 18px 18px' }}><div className="sk sk-chart" /></div> : payments.length === 0 ? <p style={{ padding: '30px', color: '#aaa', fontSize: 12 }}>No data yet.</p> : (
            <div className="donut-layout">
              <div className="donut-chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={payments} dataKey="total" nameKey="payment_method" innerRadius={55} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                      {payments.map((_, i) => <Cell key={i} fill={[C[1], C[0], C[2], C[3]][i % 4]} />)}
                    </Pie>
                    <Tooltip formatter={v => money(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="donut-legend-table">
                <div className="donut-legend-header"><span>Payment Method</span><span>%</span><span style={{ textAlign: 'right' }}>Volume</span></div>
                {payments.map((x, i) => (
                  <div className="donut-legend-row" key={x.payment_method}>
                    <div className="donut-legend-name"><div className="donut-legend-dot" style={{ background: [C[1], C[0], C[2], C[3]][i % 4] }} />{x.payment_method}</div>
                    <span className="donut-legend-pct">{pct(x.total, totalPmt)}%</span>
                    <span className="donut-legend-val">{money(x.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly bar — full width */}
      <div className="card mb14">
        <div className="card-head">
          <div>
            <p className="card-title">Monthly Spending</p>
            <p className="card-subtitle">MongoDB aggregation pipeline via PyMongo</p>
          </div>
          <button className="card-pill-btn">This Year <ChevronRight size={12} /></button>
        </div>
        <div className="card-body">
          {loading ? <div className="sk sk-chart" /> : (
            <div className="chart-wrap-tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tickFormatter={fmtMonth} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#aaa' }} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} tick={{ fontSize: 11, fill: '#aaa' }} width={50} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="total" radius={[5, 5, 0, 0]} maxBarSize={40}>
                    {monthly.map((_, i) => <Cell key={i} fill={i === monthly.length - 1 ? '#e8614c' : '#f5c9c3'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Spending trend — full width */}
      <div className="card mb14">
        <div className="card-head">
          <div>
            <p className="card-title">Spending Trend</p>
            <p className="card-subtitle">Daily aggregation from MongoDB</p>
          </div>
        </div>
        <div className="card-body">
          {loading ? <div className="sk sk-chart" /> : (
            <div className="chart-wrap-tall">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="trendG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e8614c" stopOpacity=".18" />
                      <stop offset="100%" stopColor="#e8614c" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#aaa' }} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} tick={{ fontSize: 11, fill: '#aaa' }} width={50} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="total" stroke="#e8614c" fill="url(#trendG)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top Merchants */}
      <div className="card">
        <div className="card-head">
          <div>
            <p className="card-title">Top Merchants</p>
            <p className="card-subtitle">Highest cumulative spend — PyMongo $group aggregation</p>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '0 18px 14px' }}>{[0, 1, 2, 3, 4].map(i => <div key={i} style={{ display: 'flex', gap: 8, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}><div className="sk" style={{ width: 28, height: 28, borderRadius: 6 }} /><div style={{ flex: 1 }}><div className="sk sk-h14" style={{ width: '70%', marginBottom: 4 }} /><div className="sk sk-h14" style={{ width: '40%' }} /></div><div className="sk sk-h14" style={{ width: 56 }} /></div>)}</div>
        ) : merchants.length === 0 ? (
          <p style={{ padding: '24px 18px', color: '#aaa', fontSize: 12 }}>No merchant data yet.</p>
        ) : (
          merchants.map((m, i) => (
            <div className="merchant-row" key={m.merchant}>
              <span className="merchant-rank">{String(i + 1).padStart(2, '0')}</span>
              <div className="merchant-initial">{(m.merchant[0] || '?').toUpperCase()}</div>
              <div className="merchant-info">
                <strong>{m.merchant}</strong>
                <span>{m.transactions} txn{m.transactions !== 1 ? 's' : ''}</span>
              </div>
              <span className="merchant-amount">{money(m.total)}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SHARED: Transaction Table
══════════════════════════════════════════════════════════════════════════ */
function TxTable({ expenses, loading, onEdit, onDelete, showEmpty }) {
  if (loading) {
    return (
      <div style={{ padding: '4px 0' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '13px 14px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
            <div className="sk sk-h14" style={{ width: 70 }} />
            <div className="sk sk-h14" style={{ flex: 1 }} />
            <div className="sk sk-h14" style={{ width: 70 }} />
            <div className="sk sk-h14" style={{ width: 60 }} />
            <div className="sk sk-h14" style={{ width: 50 }} />
            <div className="sk sk-h14" style={{ width: 55 }} />
          </div>
        ))}
      </div>
    );
  }
  if (!expenses.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Receipt size={22} /></div>
        <h3>No expenses found</h3>
        <p>{showEmpty ? 'Try adjusting your filters or add a new expense.' : 'Start tracking by adding your first expense.'}</p>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Merchant</th>
            <th>Payment</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(x => (
            <tr key={x._id}>
              <td className="td-muted">{shortDate(x.date)}</td>
              <td className="td-desc" title={x.description}>{x.description}</td>
              <td><span className={`badge ${catClass(x.category)}`}>{x.category}</span></td>
              <td className="td-muted">{x.merchant || '—'}</td>
              <td><span className={`badge ${pmtClass(x.payment_method)}`}>{x.payment_method}</span></td>
              <td className="td-amount">{money(x.amount)}</td>
              <td>
                <div className="td-actions">
                  <button id={`edit-${x._id}`} className="btn-icon" title="Edit" onClick={() => onEdit(x)}><Pencil size={13} /></button>
                  <button id={`del-${x._id}`} className="btn-icon danger" title="Delete" onClick={() => onDelete(x)}><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SHARED: KPI Cell
══════════════════════════════════════════════════════════════════════════ */
function KpiCell({ id, icon, label, value, change }) {
  return (
    <div id={id} className="kpi-cell">
      <div className="kpi-cell-header">
        <div className="kpi-label-row">
          <span className="kpi-icon">{icon}</span>
          {label}
        </div>
        <span className="kpi-dots">···</span>
      </div>
      <div className="kpi-value">{value}</div>
      {change && (
        <div className={`kpi-change ${change > 0 ? 'up' : 'down'}`}>
          {change > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {Math.abs(change)}%
          <span className="kpi-change-label">vs last month</span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODAL: Add / Edit
══════════════════════════════════════════════════════════════════════════ */
function ExpenseModal({ form, setForm, editing, onSubmit, onClose }) {
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">{editing ? 'Edit Transaction' : 'New Transaction'}</p>
            <h3>{editing ? 'Edit Expense' : 'Record a New Expense'}</h3>
            <p>Validated by MongoDB schema rules.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={14} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-field">
                <label className="form-label" htmlFor="f-amt">Amount (₹)</label>
                <input id="f-amt" className="form-input" type="number" min="0.01" step="0.01" required placeholder="e.g. 450" value={form.amount} onChange={e => u('amount', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="f-date">Date</label>
                <input id="f-date" className="form-input" type="date" required value={form.date} onChange={e => u('date', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="f-cat">Category</label>
                <select id="f-cat" className="form-select" value={form.category} onChange={e => u('category', e.target.value)}>
                  {CATEGORIES.map(x => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="f-pmt">Payment Method</label>
                <select id="f-pmt" className="form-select" value={form.payment_method} onChange={e => u('payment_method', e.target.value)}>
                  {PAYMENTS.map(x => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="form-field full">
                <label className="form-label" htmlFor="f-desc">Description</label>
                <input id="f-desc" className="form-input" type="text" required placeholder="What was this expense for?" value={form.description} onChange={e => u('description', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="f-merch">Merchant <span className="opt">(optional)</span></label>
                <input id="f-merch" className="form-input" type="text" placeholder="e.g. Campus Cafe" value={form.merchant} onChange={e => u('merchant', e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="f-tags">Tags <span className="opt">(comma separated)</span></label>
                <input id="f-tags" className="form-input" type="text" placeholder="food, college" value={form.tags} onChange={e => u('tags', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button id="form-submit-btn" type="submit" className="btn btn-primary btn-sm">
              {editing ? <><Pencil size={12} /> Save Changes</> : <><Plus size={12} /> Add Expense</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MODAL: Delete Confirm
══════════════════════════════════════════════════════════════════════════ */
function DeleteModal({ expense, onConfirm, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="alertdialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-body" style={{ padding: '26px 22px 18px' }}>
          <div className="del-icon-wrap"><Trash2 size={22} /></div>
          <p className="del-title">Delete expense?</p>
          <p className="del-text">
            Are you sure you want to remove <strong>"{expense.description}"</strong>?
            This will permanently delete this record from MongoDB.
          </p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button id="confirm-delete-btn" className="btn btn-delete btn-sm" onClick={onConfirm}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
