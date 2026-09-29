import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, FileText, Wallet, ClipboardList, Settings, LogOut, Menu, X, Plus, Search,
  ChevronRight, Clock3, CheckCircle2, PlayCircle, PackageCheck, MoreHorizontal, Eye, Pencil,
  Copy, Trash2, SlidersHorizontal, UserRound, Building2, Phone, MapPin, Mail, ArrowLeft,
  Download, MessageCircle, AlertCircle, LoaderCircle, Save, UserPlus, LockKeyhole, RefreshCw
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './styles.css';

const nav = [
  ['home', 'Início', LayoutDashboard],
  ['quotes', 'Orçamentos', FileText],
  ['finance', 'Financeiro', Wallet],
  ['tickets', 'Chamados', ClipboardList],
  ['settings', 'Configurações', Settings],
];

const statusLabel = {
  aguardando_resposta: 'Aguardando resposta',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
};

const money = (v = 0) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateBR = (v) => v ? new Date(`${v}T12:00:00`).toLocaleDateString('pt-BR') : '—';


const PRINT_CSS = `
@page { size: A4 portrait; margin: 0; }
@media print {
  html, body, #root { margin:0 !important; padding:0 !important; width:210mm !important; min-height:297mm !important; background:#fff !important; }
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow:hidden !important; }
  .app { display:block !important; min-height:0 !important; }
  .app > .sidebar, .app > .overlay, .main > header, .quote-screen { display:none !important; }
  .main { margin:0 !important; width:210mm !important; min-height:0 !important; }
  .print-wrap { display:block !important; width:210mm !important; height:297mm !important; margin:0 !important; padding:0 !important; }
  .print-document { display:block !important; width:210mm !important; height:297mm !important; box-sizing:border-box !important; overflow:hidden !important; margin:0 !important; padding:8mm 10mm 7mm !important; background:#fff !important; color:#152238 !important; font-family:Arial, Helvetica, sans-serif !important; font-size:8px !important; line-height:1.25 !important; }
  .pdf-header { display:flex !important; justify-content:space-between !important; align-items:flex-start !important; padding-bottom:5mm !important; border-bottom:1px solid #dbe4ef !important; }
  .pdf-brand { display:flex !important; align-items:center !important; gap:7px !important; }
  .pdf-logo { width:27px !important; height:27px !important; border-radius:7px !important; background:#0e4d8d !important; color:#fff !important; display:flex !important; align-items:center !important; justify-content:center !important; font-size:14px !important; }
  .pdf-brand strong { display:block !important; font-size:16px !important; line-height:1 !important; }
  .pdf-brand span { display:block !important; color:#5f7894 !important; font-size:7px !important; letter-spacing:.9px !important; margin-top:3px !important; }
  .pdf-meta { text-align:right !important; display:flex !important; flex-direction:column !important; gap:2px !important; color:#5f7894 !important; }
  .pdf-meta strong { color:#0e4d8d !important; font-size:9px !important; }
  .pdf-client { display:grid !important; grid-template-columns:1fr 1fr !important; gap:10mm !important; padding:4mm 0 3mm !important; }
  .pdf-client > div { display:flex !important; flex-direction:column !important; gap:1px !important; }
  .pdf-client b, .pdf-section h2, .pdf-conditions h2 { color:#0e4d8d !important; font-size:8px !important; text-transform:uppercase !important; letter-spacing:.35px !important; margin:0 0 2px !important; }
  .pdf-client strong { font-size:9px !important; color:#152238 !important; }
  .pdf-client span { color:#50657d !important; }
  .pdf-company { border-left:2px solid #dbeafe !important; padding-left:5mm !important; }
  .pdf-section { margin-top:2mm !important; break-inside:avoid !important; }
  .pdf-section h2 { margin-bottom:2mm !important; }
  .pdf-table { width:100% !important; border-collapse:collapse !important; table-layout:fixed !important; }
  .pdf-table th { background:#eef4fa !important; color:#41566f !important; font-weight:700 !important; text-align:left !important; border:1px solid #d9e2ec !important; padding:2px 3px !important; font-size:6.8px !important; }
  .pdf-table td { border:1px solid #d9e2ec !important; padding:2px 3px !important; color:#25384d !important; font-size:6.9px !important; vertical-align:middle !important; overflow-wrap:anywhere !important; }
  .equipment-table th:nth-child(1), .equipment-table td:nth-child(1) { width:5% !important; text-align:center !important; }
  .equipment-table th:nth-child(2), .equipment-table td:nth-child(2) { width:19% !important; }
  .equipment-table th:nth-child(3), .equipment-table td:nth-child(3) { width:25% !important; }
  .equipment-table th:nth-child(4), .equipment-table td:nth-child(4) { width:18% !important; }
  .equipment-table th:nth-child(5), .equipment-table td:nth-child(5) { width:33% !important; }
  .service-table th:nth-child(1), .service-table td:nth-child(1) { width:31% !important; }
  .service-table th:nth-child(2), .service-table td:nth-child(2) { width:7% !important; text-align:center !important; }
  .service-table th:nth-child(3), .service-table td:nth-child(3) { width:15% !important; text-align:right !important; }
  .service-table th:nth-child(4), .service-table td:nth-child(4) { width:14% !important; text-align:right !important; }
  .service-table th:nth-child(5), .service-table td:nth-child(5) { width:16% !important; text-align:right !important; }
  .service-table th:nth-child(6), .service-table td:nth-child(6) { width:17% !important; text-align:right !important; font-weight:700 !important; }
  .pdf-service { margin-bottom:2.5mm !important; break-inside:avoid !important; }
  .pdf-service h3 { font-size:8px !important; color:#152238 !important; margin:0 0 1.5mm !important; }
  .pdf-subtotal { text-align:right !important; padding-top:1mm !important; color:#50657d !important; font-size:7px !important; }
  .pdf-subtotal strong { color:#152238 !important; margin-left:10px !important; font-size:8px !important; }
  .pdf-total { display:flex !important; align-items:center !important; justify-content:space-between !important; background:#e8f2ff !important; border:1px solid #cfe2fb !important; border-radius:5px !important; padding:4mm 5mm !important; margin-top:3mm !important; break-inside:avoid !important; }
  .pdf-total span { color:#0e4d8d !important; font-size:8px !important; font-weight:800 !important; letter-spacing:.35px !important; }
  .pdf-total strong { color:#0e4d8d !important; font-size:15px !important; }
  .pdf-bottom { display:grid !important; grid-template-columns:1fr 45mm !important; gap:8mm !important; align-items:end !important; margin-top:4mm !important; break-inside:avoid !important; }
  .pdf-conditions ul { margin:1mm 0 0 4mm !important; padding:0 !important; color:#50657d !important; }
  .pdf-conditions li { margin:0 0 1px !important; }
  .pdf-thanks { text-align:center !important; color:#0e4d8d !important; font-family:cursive !important; font-size:13px !important; line-height:1.1 !important; transform:rotate(-3deg) !important; }
  .pdf-notes { margin-top:3mm !important; padding-top:2mm !important; border-top:1px solid #dbe4ef !important; color:#50657d !important; font-size:7px !important; }
}
@media screen { .print-wrap { display:none; } }
`;

function Badge({ status }) {
  const label = statusLabel[status] || status;
  return <span className={`badge ${status}`}><i /> {label}</span>;
}

function Loading({ label = 'Carregando...' }) {
  return <div className="loading"><LoaderCircle className="spin" size={22} /> {label}</div>;
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      if (mode === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onAuth(data.session);
      } else if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (err) throw err;
        if (!data.session) setMessage('Cadastro criado. Verifique seu e-mail para confirmar o acesso.');
        else onAuth(data.session);
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (err) throw err;
        setMessage('Enviamos um link de recuperação para seu e-mail.');
      }
    } catch (err) {
      setError(err.message || 'Não foi possível concluir a operação.');
    } finally { setLoading(false); }
  }

  return <div className="auth-page">
    <div className="auth-card">
      <div className="auth-brand"><div className="brandmark">F</div><div><strong>Frios&Clima</strong><small>Refrigeração</small></div></div>
      <div className="auth-copy"><h1>{mode === 'login' ? 'Bem-vindo de volta' : mode === 'signup' ? 'Criar acesso' : 'Recuperar senha'}</h1><p>{mode === 'login' ? 'Entre para acompanhar seus orçamentos e serviços.' : mode === 'signup' ? 'Crie o acesso do responsável pelo sistema.' : 'Informe seu e-mail para receber o link de recuperação.'}</p></div>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <label>Nome<input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do responsável" required /></label>}
        <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required /></label>
        {mode !== 'reset' && <label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" minLength={6} required /></label>}
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}
        <button className="primary full" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={18} />}{mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}</button>
      </form>
      <div className="auth-links">
        {mode === 'login' && <><button onClick={() => setMode('reset')}>Esqueci minha senha</button><span>·</span><button onClick={() => setMode('signup')}>Criar conta</button></>}
        {mode !== 'login' && <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Voltar para login</button>}
      </div>
    </div>
  </div>;
}

function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState('home');
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  const go = (p) => { setPage(p); setSelected(null); setMobile(false); };
  const refreshData = () => setRefresh(v => v + 1);

  if (checking) return <Loading label="Conectando..." />;
  if (!session) return <Auth onAuth={setSession} />;

  return <><style>{PRINT_CSS}</style><div className="app">
    <aside className={`sidebar ${mobile ? 'open' : ''}`}>
      <div className="brand"><div className="brandmark">F</div><div><strong>Frios&Clima</strong><small>Refrigeração</small></div><button className="close" onClick={() => setMobile(false)}><X size={20}/></button></div>
      <div className="profile"><div className="avatar">FC</div><div><strong>{session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Administrador'}</strong><small>Administrador</small></div></div>
      <nav>{nav.map(([id, label, Icon]) => <button key={id} className={page === id && !selected ? 'active' : ''} onClick={() => go(id)}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button onClick={() => supabase.auth.signOut()}><LogOut size={18}/> Sair</button></div>
    </aside>
    {mobile && <div className="overlay" onClick={() => setMobile(false)} />}
    <main className="main">
      <header><button className="menu" onClick={() => setMobile(true)}><Menu/></button><div className="header-search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar orçamento, cliente..."/></div><div className="header-user"><div className="avatar small">FC</div><span>Frios&Clima</span></div></header>
      {selected ? <QuoteDetail quote={selected} back={() => setSelected(null)} onChanged={refreshData} /> : page === 'newQuote' ? <NewQuote go={go} /> : page === 'home' ? <Home go={go} setSelected={setSelected} refresh={refresh} /> : page === 'quotes' ? <Quotes search={search} setSelected={setSelected} go={go} refresh={refresh} /> : page === 'finance' ? <Finance setSelected={setSelected} refresh={refresh} /> : page === 'tickets' ? <Tickets setSelected={setSelected} refresh={refresh} /> : <SettingsPage refresh={refreshData} />}
    </main>
  </div></>;
}

function PageHead({ title, sub, action }) { return <div className="pagehead"><div><h1>{title}</h1><p>{sub}</p></div>{action}</div>; }

function useQuotes(refresh) {
  const [quotes, setQuotes] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let alive = true; (async () => { setLoading(true); const { data, error } = await supabase.from('refrig_quotes').select('*, refrig_clients(name, phone, whatsapp, email, address)').order('created_at', { ascending: false }); if (alive) { setQuotes(data || []); setError(error?.message || ''); setLoading(false); } })(); return () => { alive = false; }; }, [refresh]);
  return { quotes, loading, error };
}

function Home({ go, setSelected, refresh }) {
  const { quotes, loading, error } = useQuotes(refresh);
  const counts = useMemo(() => ({
    aguardando_resposta: quotes.filter(q => q.status === 'aguardando_resposta').length,
    aprovado: quotes.filter(q => q.status === 'aprovado').length,
    em_andamento: quotes.filter(q => q.status === 'em_andamento').length,
    concluido: quotes.filter(q => q.status === 'concluido').length,
  }), [quotes]);
  const attention = quotes.filter(q => q.status === 'aguardando_resposta').slice(0, 5);
  const approved = quotes.filter(q => ['aprovado', 'em_andamento', 'concluido'].includes(q.status));
  const total = approved.reduce((a, q) => a + Number(q.total_final || 0), 0);
  return <div className="content"><PageHead title="Olá, Frios&Clima 👋" sub="Acompanhe seus orçamentos e serviços de hoje." action={<button className="primary" onClick={() => go('quotes')}><Plus size={18}/> Novo orçamento</button>}/>
    {error && <div className="form-error">{error}</div>}
    <div className="stats"><Stat icon={Clock3} label="Aguardando resposta" value={String(counts.aguardando_resposta).padStart(2,'0')} tone="orange"/><Stat icon={CheckCircle2} label="Aprovados" value={String(counts.aprovado).padStart(2,'0')} tone="green"/><Stat icon={PlayCircle} label="Em andamento" value={String(counts.em_andamento).padStart(2,'0')} tone="blue"/><Stat icon={PackageCheck} label="Concluídos" value={String(counts.concluido).padStart(2,'0')} tone="purple"/></div>
    <section className="panel"><div className="panel-head"><div><h2>Orçamentos que precisam de atenção</h2><p>Acompanhe os clientes que ainda não responderam.</p></div><button className="link" onClick={() => go('quotes')}>Ver todos <ChevronRight size={16}/></button></div>
      {loading ? <Loading/> : attention.length ? attention.map(q => <div className="attention" key={q.id}><div className="attention-icon"><AlertCircle size={20}/></div><div className="grow"><strong>ORC-{String(q.quote_number).padStart(4,'0')} · {q.refrig_clients?.name || 'Cliente'}</strong><span>{q.refrig_quote_items?.[0]?.service_name || 'Serviço'} · criado em {dateBR(q.issue_date)}</span></div><strong>{money(q.total_final)}</strong><Badge status={q.status}/><button className="iconbtn" onClick={() => setSelected(q)}><Eye size={18}/></button></div>) : <Empty title="Nenhum orçamento aguardando resposta" text="Quando você enviar uma proposta, ela aparecerá aqui."/>}
    </section>
    <section className="panel"><div className="panel-head"><div><h2>Resumo financeiro</h2><p>Valores dos orçamentos aprovados, em andamento e concluídos.</p></div><button className="link" onClick={() => go('finance')}>Ver financeiro <ChevronRight size={16}/></button></div><div className="finance-summary"><div><span>Total aprovado</span><strong>{money(total)}</strong></div><div><span>Serviços aprovados</span><strong>{approved.length}</strong></div><div><span>Ticket médio</span><strong>{money(approved.length ? total / approved.length : 0)}</strong></div></div></section>
  </div>;
}

function Stat({ icon: Icon, label, value, tone }) { return <div className="stat"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong></div></div>; }
function Empty({ title, text }) { return <div className="empty"><strong>{title}</strong><span>{text}</span></div>; }

function Quotes({ search, setSelected, go, refresh }) {
  const { quotes, loading, error } = useQuotes(refresh); const [filter, setFilter] = useState('todos');
  const filtered = quotes.filter(q => (filter === 'todos' || q.status === filter) && `${q.quote_number} ${q.refrig_clients?.name || ''} ${q.status}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="content"><PageHead title="Orçamentos" sub="Crie, acompanhe e organize suas propostas." action={<button className="primary" onClick={() => go('newQuote')}><Plus size={18}/> Novo orçamento</button>}/>
    {error && <div className="form-error">{error}</div>}
    <div className="toolbar"><div className="tabs">{[['todos','Todos'],['aguardando_resposta','Aguardando'],['aprovado','Aprovados'],['em_andamento','Em andamento'],['concluido','Concluídos'],['recusado','Recusados']].map(([id,label]) => <button key={id} className={filter === id ? 'selected' : ''} onClick={() => setFilter(id)}>{label} <b>{id === 'todos' ? quotes.length : quotes.filter(q => q.status === id).length}</b></button>)}</div><button className="filter"><SlidersHorizontal size={17}/> Filtros</button></div>
    {loading ? <Loading/> : <div className="tablepanel"><table><thead><tr><th>Orçamento</th><th>Cliente</th><th>Data</th><th>Valor</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(q => <tr key={q.id} onClick={() => setSelected(q)}><td><strong>ORC-{String(q.quote_number).padStart(4,'0')}</strong></td><td>{q.refrig_clients?.name || 'Cliente'}</td><td>{dateBR(q.issue_date)}</td><td><strong>{money(q.total_final)}</strong></td><td><Badge status={q.status}/></td><td><button className="iconbtn"><MoreHorizontal size={19}/></button></td></tr>)}</tbody></table>{!filtered.length && <Empty title="Nenhum orçamento encontrado" text="Crie seu primeiro orçamento para começar."/>}</div>}
    <div className="mobile-cards">{filtered.map(q => <div className="quote-card" key={q.id} onClick={() => setSelected(q)}><div><strong>ORC-{String(q.quote_number).padStart(4,'0')}</strong><Badge status={q.status}/></div><h3>{q.refrig_clients?.name || 'Cliente'}</h3><p>{dateBR(q.issue_date)}</p><strong>{money(q.total_final)}</strong></div>)}</div>
  </div>;
}


function NewQuote({ go }) {
  const [client, setClient] = useState({ name:'', phone:'', whatsapp:'', email:'', address:'', notes:'' });
  const [equipment, setEquipment] = useState([{ type:'', brand:'', model:'', capacity:'', observation:'' }]);
  const [items, setItems] = useState([{ equipmentIndex:0, service_name:'Lavagem completa', service_description:'', quantity:1, original:'', discount:'', final:'' }]);
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const addEquipment = () => { const next = [...equipment, {type:'',brand:'',model:'',capacity:'',observation:''}]; setEquipment(next); setItems([...items, { equipmentIndex: next.length-1, service_name:'', service_description:'', quantity:1, original:'', discount:'', final:'' }]); };
  const addItem = () => setItems([...items, { equipmentIndex:0, service_name:'', service_description:'', quantity:1, original:'', discount:'', final:'' }]);
  const updateEquipment = (i,key,value) => setEquipment(equipment.map((e,idx)=>idx===i?{...e,[key]:value}:e));
  const updateItem = (i,key,value) => setItems(items.map((it,idx)=>idx===i?{...it,[key]:value}:it));
  const total = items.reduce((sum,it)=>sum + Number(it.quantity||0) * Number(it.final||0), 0);
  async function save() {
    setError(''); if (!client.name.trim()) return setError('Informe o nome do cliente.');
    if (equipment.some(e => !e.type.trim())) return setError('Informe o tipo de todos os equipamentos.');
    if (!items.length || items.some(i => !i.service_name.trim() || !i.final)) return setError('Informe o serviço e o valor final de cada item.');
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser(); const owner_id = auth.user.id;
      const { data: c, error: ce } = await supabase.from('refrig_clients').insert({ owner_id, ...client }).select().single(); if (ce) throw ce;
      const { data: eq, error: ee } = await supabase.from('refrig_equipment').insert(equipment.map(e => ({ owner_id, client_id:c.id, equipment_type:e.type, brand:e.brand, model:e.model, capacity:e.capacity, observation:e.observation }))).select().order('created_at'); if (ee) throw ee;
      const { data: q, error: qe } = await supabase.from('refrig_quotes').insert({ owner_id, client_id:c.id, notes:client.notes, total_original:items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.original||0),0), total_discount:items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.discount||0),0), total_final:total }).select().single(); if (qe) throw qe;
      const rows = items.map(i => ({ quote_id:q.id, equipment_id:eq[i.equipmentIndex].id, service_name:i.service_name, service_description:i.service_description, quantity:Number(i.quantity||1), unit_original_value:Number(i.original||0), unit_discount:Number(i.discount||0), unit_final_value:Number(i.final||0) }));
      const { error: ie } = await supabase.from('refrig_quote_items').insert(rows); if (ie) throw ie;
      go('quotes');
    } catch (e) { setError(e.message || 'Não foi possível salvar o orçamento.'); }
    finally { setSaving(false); }
  }
  return <div className="content"><button className="back" onClick={() => go('quotes')}><ArrowLeft size={18}/> Voltar</button><PageHead title="Criar orçamento" sub="Monte uma proposta com serviços e valores por equipamento." action={<button className="primary" onClick={save} disabled={saving}>{saving?<LoaderCircle className="spin" size={18}/>:<Save size={18}/>} Salvar orçamento</button>}/>{error&&<div className="form-error">{error}</div>}
    <section className="panel form-section"><div className="panel-head"><div><h2>1. Cliente</h2><p>Quem receberá o orçamento.</p></div></div><div className="form-grid">{[['name','Nome','text'],['phone','Telefone','text'],['whatsapp','WhatsApp','text'],['email','E-mail','email'],['address','Endereço','text']].map(([k,l,t])=><label key={k}>{l}<input type={t} value={client[k]} onChange={e=>setClient({...client,[k]:e.target.value})}/></label>)}</div><label>Observações<textarea value={client.notes} onChange={e=>setClient({...client,notes:e.target.value})}/></label></section>
    <section className="panel form-section"><div className="panel-head"><div><h2>2. Equipamentos</h2><p>Cadastre cada equipamento que receberá serviço.</p></div><button className="secondary" onClick={addEquipment}><Plus size={16}/> Adicionar equipamento</button></div>{equipment.map((e,i)=><div className="equipment-form" key={i}><div className="mini-index">{String(i+1).padStart(2,'0')}</div><div className="form-grid equipment-fields"><label>Tipo*<input value={e.type} onChange={ev=>updateEquipment(i,'type',ev.target.value)} placeholder="Ex.: Piso-Teto"/></label><label>Marca<input value={e.brand} onChange={ev=>updateEquipment(i,'brand',ev.target.value)}/></label><label>Modelo<input value={e.model} onChange={ev=>updateEquipment(i,'model',ev.target.value)}/></label><label>Capacidade<input value={e.capacity} onChange={ev=>updateEquipment(i,'capacity',ev.target.value)} placeholder="60.000 BTU"/></label></div></div>)}</section>
    <section className="panel form-section"><div className="panel-head"><div><h2>3. Serviços</h2><p>O mesmo equipamento pode ter vários serviços e cada combinação tem seu próprio preço.</p></div><button className="secondary" onClick={addItem}><Plus size={16}/> Adicionar serviço</button></div>{items.map((it,i)=><div className="service-editor" key={i}><div className="service-editor-head"><strong>Serviço {String(i+1).padStart(2,'0')}</strong><button className="iconbtn" onClick={()=>setItems(items.filter((_,idx)=>idx!==i))} disabled={items.length===1}><Trash2 size={17}/></button></div><div className="form-grid"><label>Equipamento<select value={it.equipmentIndex} onChange={e=>updateItem(i,'equipmentIndex',Number(e.target.value))}>{equipment.map((e,idx)=><option key={idx} value={idx}>{idx+1}. {e.type||'Equipamento'}</option>)}</select></label><label>Serviço*<input value={it.service_name} onChange={e=>updateItem(i,'service_name',e.target.value)} placeholder="Lavagem completa"/></label><label>Quantidade<input type="number" min="1" value={it.quantity} onChange={e=>updateItem(i,'quantity',e.target.value)}/></label><label>Valor original<input type="number" step="0.01" value={it.original} onChange={e=>updateItem(i,'original',e.target.value)}/></label><label>Desconto<input type="number" step="0.01" value={it.discount} onChange={e=>updateItem(i,'discount',e.target.value)}/></label><label>Valor final*<input type="number" step="0.01" value={it.final} onChange={e=>updateItem(i,'final',e.target.value)}/></label></div><div className="item-total">Total do item <strong>{money(Number(it.quantity||0)*Number(it.final||0))}</strong></div></div>)}</section>
    <section className="panel total-box"><span>Total do orçamento</span><strong>{money(total)}</strong></section>
  </div>;
}

function QuoteDetail({ quote, back, onChanged }) {
  const [saving,setSaving]=useState(false);
  const [status,setStatus]=useState(quote.status);
  const [items,setItems]=useState([]);
  const [company,setCompany]=useState({company_name:'Frios&Clima',document:'',phone:'',whatsapp:'',email:'',address:''});

  useEffect(()=>{
    let alive=true;
    supabase.from('refrig_quote_items')
      .select('*, refrig_equipment(equipment_type,brand,model,capacity,observation)')
      .eq('quote_id',quote.id)
      .then(({data})=>{ if(alive) setItems(data||[]); });
    supabase.auth.getUser().then(async({data})=>{
      if(!data.user || !alive) return;
      const {data:row}=await supabase.from('refrig_company').select('*').eq('owner_id',data.user.id).maybeSingle();
      if(row && alive) setCompany(row);
    });
    return ()=>{alive=false;};
  },[quote.id]);

  async function changeStatus(next){
    setSaving(true);
    const {error}=await supabase.from('refrig_quotes').update({status:next}).eq('id',quote.id);
    if(!error){setStatus(next);onChanged();} else alert(error.message);
    setSaving(false);
  }

  const client=quote.refrig_clients||{};

  return <>
    <div className="quote-screen content">
      <button className="back" onClick={back}><ArrowLeft size={18}/> Voltar para orçamentos</button>
      <PageHead title={`ORC-${String(quote.quote_number).padStart(4,'0')}`} sub="Detalhes do orçamento" action={<div className="actions"><button className="secondary"><Pencil size={17}/> Editar</button><button className="secondary" onClick={()=>window.print()}><Download size={17}/> PDF</button><button className="primary"><MessageCircle size={17}/> WhatsApp</button></div>}/>
      <div className="detail-grid">
        <section className="panel"><div className="panel-head"><div><h2>Cliente</h2><p>Dados do solicitante</p></div><Badge status={status}/></div><div className="info-grid"><Info icon={UserRound} label="Nome" value={client.name||'—'}/><Info icon={Phone} label="Telefone" value={client.phone||'—'}/><Info icon={MapPin} label="Endereço" value={client.address||'—'}/><Info icon={Mail} label="E-mail" value={client.email||'—'}/></div></section>
        <section className="panel"><div className="panel-head"><div><h2>Serviços</h2><p>Composição do orçamento</p></div></div>{items.map(i=><div className="service-line" key={i.id}><div><strong>{i.service_name}</strong><span>{i.quantity} × {i.refrig_equipment?.equipment_type || 'Equipamento'} {i.refrig_equipment?.capacity || ''}</span></div><strong>{money(Number(i.unit_final_value||0)*Number(i.quantity||1))}</strong></div>)}<div className="total"><span>Total</span><strong>{money(quote.total_final)}</strong></div></section>
      </div>
      <section className="panel"><div className="panel-head"><div><h2>Status</h2><p>Atualize o andamento do orçamento.</p></div></div><div className="status-actions">{[['aguardando_resposta','Aguardando resposta'],['aprovado','Aprovar'],['recusado','Recusar'],['em_andamento','Em andamento'],['concluido','Concluir']].map(([id,label])=><button key={id} className={status===id?'selected':''} disabled={saving} onClick={()=>changeStatus(id)}>{label}</button>)}</div></section>
      {quote.notes && <section className="panel"><h2>Observações</h2><p className="note">{quote.notes}</p></section>}
    </div>
    <div className="print-wrap">
      <PrintQuote quote={{...quote,status}} client={client} items={items} company={company}/>
    </div>
  </>;
}

function PrintQuote({quote,client,items,company}) {
  const groups=[];
  items.forEach(item=>{
    const key=item.service_name||'Serviço';
    let group=groups.find(g=>g.name===key);
    if(!group){group={name:key,items:[]};groups.push(group);}
    group.items.push(item);
  });
  const equipment=[];
  const seen=new Set();
  items.forEach(item=>{
    const e=item.refrig_equipment||{};
    if(!seen.has(item.equipment_id)){
      seen.add(item.equipment_id);
      equipment.push({
        number:equipment.length+1,
        type:e.equipment_type||'—',
        model:[e.brand,e.model].filter(Boolean).join(' / ')||'—',
        capacity:e.capacity||'—',
        observation:e.observation||'—'
      });
    }
  });
  const issueDate=quote.issue_date || quote.created_at?.slice(0,10);
  const validity=quote.validity_days || 7;
  const companyName=company.company_name || 'Frios&Clima';
  const total=Number(quote.total_final||0);

  return <div className="print-document">
    <div className="pdf-header">
      <div className="pdf-brand"><div className="pdf-logo">✦</div><div><strong>{companyName}</strong><span>REFRIGERAÇÃO</span></div></div>
      <div className="pdf-meta"><strong>ORÇAMENTO Nº {String(quote.quote_number).padStart(4,'0')}</strong><span>Data: {dateBR(issueDate)}</span><span>Validade: {validity} dias</span></div>
    </div>

    <div className="pdf-client">
      <div><b>Cliente</b><strong>{client.name||'—'}</strong><span>{client.phone||client.whatsapp||'—'}</span><span>{client.address||'—'}</span>{client.email&&<span>{client.email}</span>}</div>
      <div className="pdf-company"><b>Contato</b>{company.phone&&<span>{company.phone}</span>}{company.whatsapp&&<span>{company.whatsapp}</span>}{company.document&&<span>{company.document}</span>}</div>
    </div>

    {equipment.length>0 && <section className="pdf-section"><h2>Equipamentos</h2><table className="pdf-table equipment-table"><thead><tr><th>#</th><th>Tipo</th><th>Marca / Modelo</th><th>Capacidade</th><th>Observação</th></tr></thead><tbody>{equipment.map(e=><tr key={`${e.number}-${e.type}`}><td>{String(e.number).padStart(2,'0')}</td><td>{e.type}</td><td>{e.model}</td><td>{e.capacity}</td><td>{e.observation}</td></tr>)}</tbody></table></section>}

    <section className="pdf-section"><h2>Serviços</h2>{groups.map((group,index)=>{
      const subtotal=group.items.reduce((sum,i)=>sum + Number(i.quantity||1)*Number(i.unit_final_value||0),0);
      return <div className="pdf-service" key={group.name+index}>
        <h3>{index+1}. {group.name}</h3>
        <table className="pdf-table service-table"><thead><tr><th>Equipamento</th><th>Qtd.</th><th>Valor original</th><th>Desconto</th><th>Valor final</th><th>Total</th></tr></thead><tbody>{group.items.map(i=>{
          const e=i.refrig_equipment||{};
          const unitOriginal=Number(i.unit_original_value||0);
          const unitDiscount=Number(i.unit_discount||0);
          const unitFinal=Number(i.unit_final_value||0);
          const qty=Number(i.quantity||1);
          return <tr key={i.id}><td>{[e.equipment_type,e.capacity].filter(Boolean).join(' - ')||'Equipamento'}</td><td>{qty}</td><td>{money(unitOriginal)}</td><td>{money(unitDiscount)}</td><td>{money(unitFinal)}</td><td>{money(unitFinal*qty)}</td></tr>;
        })}</tbody></table>
        <div className="pdf-subtotal">Subtotal do serviço <strong>{money(subtotal)}</strong></div>
      </div>;
    })}</section>

    <div className="pdf-total"><span>VALOR TOTAL DO ORÇAMENTO</span><strong>{money(total)}</strong></div>

    <div className="pdf-bottom">
      <div className="pdf-conditions"><h2>Condições</h2><ul><li>Orçamento referente exclusivamente aos serviços descritos.</li><li>Peças, reparos e materiais adicionais, caso necessários, serão cobrados à parte.</li><li>Validade do orçamento: {validity} dias.</li><li>Forma de pagamento: a combinar.</li></ul></div>
      <div className="pdf-thanks">Obrigado<br/>pela confiança!</div>
    </div>
    {quote.notes && <div className="pdf-notes"><b>Observações:</b> {quote.notes}</div>}
  </div>;
}
function Info({icon:Icon,label,value}){return <div className="info"><Icon size={17}/><div><small>{label}</small><span>{value}</span></div></div>}

function Finance({setSelected,refresh}) { const {quotes,loading}=useQuotes(refresh); const approved=quotes.filter(q=>['aprovado','em_andamento','concluido'].includes(q.status)); const total=approved.reduce((a,q)=>a+Number(q.total_final||0),0); return <div className="content"><PageHead title="Financeiro" sub="Acompanhe os valores dos serviços aprovados."/><div className="finance-cards"><div className="bigmetric"><span>Total aprovado</span><strong>{money(total)}</strong><small>Orçamentos aprovados, em andamento e concluídos.</small></div><div className="bigmetric"><span>Serviços aprovados</span><strong>{approved.length}</strong><small>Chamados vinculados ao orçamento.</small></div></div><div className="tablepanel"><div className="table-title"><div><h2>Movimentações</h2><p>Clique em um item para consultar o orçamento.</p></div></div>{loading?<Loading/>:<table><thead><tr><th>Orçamento</th><th>Cliente</th><th>Data</th><th>Status</th><th>Valor</th></tr></thead><tbody>{approved.map(q=><tr key={q.id} onClick={()=>setSelected(q)}><td><strong>ORC-{String(q.quote_number).padStart(4,'0')}</strong></td><td>{q.refrig_clients?.name||'Cliente'}</td><td>{dateBR(q.issue_date)}</td><td><Badge status={q.status}/></td><td><strong>{money(q.total_final)}</strong></td></tr>)}</tbody></table>}</div></div> }

function Tickets({setSelected,refresh}) { const [tickets,setTickets]=useState([]); const [loading,setLoading]=useState(true); useEffect(()=>{supabase.from('refrig_service_calls').select('*, refrig_quotes(*, refrig_clients(name))').order('created_at',{ascending:false}).then(({data})=>{setTickets(data||[]);setLoading(false);});},[refresh]); return <div className="content"><PageHead title="Chamados" sub="Serviços aprovados e em execução."/><div className="ticket-filters"><button className="selected">Todos <b>{tickets.length}</b></button><button>Aprovados</button><button>Em andamento</button><button>Concluídos</button></div>{loading?<Loading/>:<div className="ticket-list">{tickets.map(t=><div className="ticket" key={t.id} onClick={()=>t.refrig_quotes&&setSelected(t.refrig_quotes)}><div className="ticket-num">CH-{String(t.call_number).padStart(4,'0')}</div><div className="grow"><strong>{t.refrig_quotes?.refrig_clients?.name||'Cliente'}</strong><span>ORC-{String(t.refrig_quotes?.quote_number||0).padStart(4,'0')}</span></div><strong>{money(t.refrig_quotes?.total_final)}</strong><Badge status={t.status==='aprovado'?'aprovado':t.status}/><ChevronRight size={18}/></div>)}{!tickets.length&&<Empty title="Nenhum chamado ainda" text="Um chamado será criado automaticamente quando um orçamento for aprovado."/>}</div>}</div> }

function SettingsPage({refresh}) { const [company,setCompany]=useState({company_name:'',document:'',phone:'',whatsapp:'',email:'',address:''}); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [message,setMessage]=useState(''); useEffect(()=>{supabase.auth.getUser().then(async({data})=>{const {data:row}=await supabase.from('refrig_company').select('*').eq('owner_id',data.user.id).maybeSingle(); if(row)setCompany(row); else setCompany(c=>({...c,email:data.user.email||''}));setLoading(false);});},[]); async function save(){setSaving(true);setMessage('');const {data}=await supabase.auth.getUser();const {error}=await supabase.from('refrig_company').upsert({...company,owner_id:data.user.id},{onConflict:'owner_id'});setMessage(error?error.message:'Dados salvos com sucesso.');setSaving(false);if(!error)refresh();} if(loading)return <div className="content"><Loading/> </div>; return <div className="content"><PageHead title="Configurações" sub="Gerencie os dados que serão usados nos próximos orçamentos e PDFs."/><div className="settings-grid"><section className="panel"><div className="panel-head"><div><h2>Perfil</h2><p>Dados do acesso atual.</p></div></div><label>E-mail<input value={company.email} readOnly/></label><button className="secondary" onClick={()=>supabase.auth.resetPasswordForEmail(company.email,{redirectTo:window.location.origin})}>Redefinir senha</button></section><section className="panel"><div className="panel-head"><div><h2>Dados da empresa</h2><p>Serão utilizados automaticamente nos documentos.</p></div></div>{[['company_name','Nome da empresa'],['document','CNPJ / CPF'],['phone','Telefone'],['whatsapp','WhatsApp'],['address','Endereço']].map(([k,l])=><label key={k}>{l}<input value={company[k]||''} onChange={e=>setCompany({...company,[k]:e.target.value})}/></label>)}{message&&<div className={message.includes('sucesso')?'form-success':'form-error'}>{message}</div>}<button className="primary" onClick={save} disabled={saving}>{saving?<LoaderCircle className="spin" size={18}/>:<Save size={18}/>} Salvar dados</button></section></div></div>; }

createRoot(document.getElementById('root')).render(<App/>);
