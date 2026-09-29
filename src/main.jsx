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

  return <div className="app">
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
  </div>;
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

async function loadPdfLibraries() {
  if (window.jspdf?.jsPDF?.API?.autoTable) return;

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      if (window.jspdf?.jsPDF?.API?.autoTable) resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.4/jspdf.plugin.autotable.min.js');
}

const pdfText = (value) => String(value ?? '—').replace(/\s+/g, ' ').trim() || '—';
const pdfMoney = (value) => money(Number(value || 0));

async function generateQuotePdf({ quote, client, items, company }) {
  await loadPdfLibraries();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const W = 210;
  const margin = 12;
  const contentW = W - margin * 2;
  const blue = [14, 77, 141];
  const dark = [21, 34, 56];
  const muted = [80, 101, 125];
  const line = [217, 226, 236];
  const lightBlue = [232, 242, 255];

  const issueDate = quote.issue_date || quote.created_at?.slice(0, 10);
  const validity = quote.validity_days || 7;
  const companyName = pdfText(company?.company_name || 'Frios&Clima');
  const total = Number(quote.total_final || 0);

  // Header
  doc.setFillColor(...blue);
  doc.roundedRect(margin, 11, 10, 10, 2, 2, 'F');
  doc.setTextColor(255,255,255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('✦', margin + 5, 17.5, { align: 'center' });

  doc.setTextColor(...dark);
  doc.setFontSize(13);
  doc.text(companyName, margin + 14, 16);
  doc.setFontSize(5.5);
  doc.setTextColor(...muted);
  doc.text('REFRIGERAÇÃO', margin + 14, 20);

  doc.setTextColor(...blue);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORÇAMENTO Nº ${String(quote.quote_number).padStart(4,'0')}`, W - margin, 14.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.setFontSize(6.5);
  doc.text(`Data: ${dateBR(issueDate)}`, W - margin, 18); 
  doc.text(`Validade: ${validity} dias`, W - margin, 21); 

  doc.setDrawColor(...line);
  doc.line(margin, 25, W - margin, 25);

  // Client / contact
  doc.setTextColor(...blue);
  doc.setFont('helvetica','bold');
  doc.setFontSize(6.5);
  doc.text('CLIENTE', margin, 31);
  doc.text('CONTATO', margin + contentW/2 + 3, 31);

  doc.setTextColor(...dark);
  doc.setFontSize(7.5);
  doc.text(pdfText(client.name), margin, 35);
  doc.setFont('helvetica','normal');
  doc.setTextColor(...muted);
  doc.setFontSize(6.5);
  const clientContact = client.phone || client.whatsapp;
  if (clientContact) doc.text(pdfText(clientContact), margin, 39);
  if (client.address) doc.text(pdfText(client.address), margin, 43);
  if (client.email) doc.text(pdfText(client.email), margin, 47);

  doc.setDrawColor(219,234,254);
  doc.setLineWidth(0.7);
  doc.line(margin + contentW/2, 31, margin + contentW/2, 47);
  doc.setLineWidth(0.2);
  let cy = 35;
  if (company?.phone) { doc.text(pdfText(company.phone), margin + contentW/2 + 4, cy); cy += 4; }
  if (company?.whatsapp) { doc.text(pdfText(company.whatsapp), margin + contentW/2 + 4, cy); cy += 4; }
  if (company?.document) { doc.text(pdfText(company.document), margin + contentW/2 + 4, cy); }

  let y = 52;
  const sectionTitle = (title) => {
    doc.setTextColor(...blue);
    doc.setFont('helvetica','bold');
    doc.setFontSize(6.5);
    doc.text(title.toUpperCase(), margin, y);
    y += 3;
  };

  const equipment = [];
  const seen = new Set();
  items.forEach(item => {
    const e = item.refrig_equipment || {};
    if (!seen.has(item.equipment_id)) {
      seen.add(item.equipment_id);
      equipment.push([
        String(equipment.length + 1).padStart(2,'0'),
        pdfText(e.equipment_type),
        [e.brand,e.model].filter(Boolean).join(' / ') || '—',
        pdfText(e.capacity),
        pdfText(e.observation)
      ]);
    }
  });

  if (equipment.length) {
    sectionTitle('Equipamentos');
    doc.autoTable({
      startY: y,
      head: [['#','TIPO','MARCA / MODELO','CAPACIDADE','OBSERVAÇÃO']],
      body: equipment,
      margin: { left: margin, right: margin },
      tableWidth: contentW,
      theme: 'grid',
      styles: { font:'helvetica', fontSize:5.7, cellPadding:1.15, textColor:dark, lineColor:line, lineWidth:.2, overflow:'linebreak', valign:'middle' },
      headStyles: { fillColor:[238,244,250], textColor:[65,86,111], fontStyle:'bold', fontSize:5.6 },
      columnStyles: { 0:{cellWidth:8,halign:'center'}, 1:{cellWidth:34}, 2:{cellWidth:44}, 3:{cellWidth:31}, 4:{cellWidth:63} },
      didDrawPage: () => {}
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  sectionTitle('Serviços');
  const groups = [];
  items.forEach(item => {
    const key = item.service_name || 'Serviço';
    let group = groups.find(g => g.name === key);
    if (!group) { group = { name:key, items:[] }; groups.push(group); }
    group.items.push(item);
  });

  groups.forEach((group, index) => {
    doc.setTextColor(...dark);
    doc.setFont('helvetica','bold');
    doc.setFontSize(6.5);
    doc.text(`${index + 1}. ${pdfText(group.name)}`, margin, y + 1);
    y += 3;

    const rows = group.items.map(i => {
      const e = i.refrig_equipment || {};
      const original = Number(i.unit_original_value || 0);
      const discount = Number(i.unit_discount || 0);
      const final = Number(i.unit_final_value || 0);
      const qty = Number(i.quantity || 1);
      return [
        [e.equipment_type, e.capacity].filter(Boolean).join(' - ') || 'Equipamento',
        String(qty),
        pdfMoney(original),
        pdfMoney(discount),
        pdfMoney(final),
        pdfMoney(final * qty)
      ];
    });

    doc.autoTable({
      startY: y,
      head: [['EQUIPAMENTO','QTD.','VALOR ORIGINAL','DESCONTO','VALOR FINAL','TOTAL']],
      body: rows,
      margin: { left: margin, right: margin },
      tableWidth: contentW,
      theme: 'grid',
      styles: { font:'helvetica', fontSize:5.45, cellPadding:1.05, textColor:dark, lineColor:line, lineWidth:.2, overflow:'linebreak', valign:'middle' },
      headStyles: { fillColor:[238,244,250], textColor:[65,86,111], fontStyle:'bold', fontSize:5.25 },
      columnStyles: { 0:{cellWidth:57}, 1:{cellWidth:10,halign:'center'}, 2:{cellWidth:30,halign:'right'}, 3:{cellWidth:27,halign:'right'}, 4:{cellWidth:29,halign:'right'}, 5:{cellWidth:31,halign:'right',fontStyle:'bold'} },
      didDrawPage: () => {}
    });
    y = doc.lastAutoTable.finalY + 2.5;
    const subtotal = group.items.reduce((sum,i) => sum + Number(i.quantity || 1) * Number(i.unit_final_value || 0), 0);
    doc.setTextColor(...muted);
    doc.setFont('helvetica','normal');
    doc.setFontSize(5.8);
    doc.text('Subtotal do serviço', W - margin - 28, y, { align:'right' });
    doc.setTextColor(...dark);
    doc.setFont('helvetica','bold');
    doc.setFontSize(6.4);
    doc.text(pdfMoney(subtotal), W - margin, y, { align:'right' });
    y += 4;
  });

  // Total
  doc.setFillColor(...lightBlue);
  doc.setDrawColor(207,226,251);
  doc.roundedRect(margin, y, contentW, 12, 1.5, 1.5, 'FD');
  doc.setTextColor(...blue);
  doc.setFont('helvetica','bold');
  doc.setFontSize(6.5);
  doc.text('VALOR TOTAL DO ORÇAMENTO', margin + 5, y + 7);
  doc.setFontSize(12);
  doc.text(pdfMoney(total), W - margin - 5, y + 7.5, { align:'right' });
  y += 17;

  // Conditions and signature
  doc.setTextColor(...blue);
  doc.setFontSize(6.5);
  doc.text('CONDIÇÕES', margin, y);
  doc.setTextColor(...muted);
  doc.setFont('helvetica','normal');
  doc.setFontSize(5.8);
  const conditions = [
    'Orçamento referente exclusivamente aos serviços descritos.',
    'Peças, reparos e materiais adicionais, caso necessários, serão cobrados à parte.',
    `Validade do orçamento: ${validity} dias.`,
    'Forma de pagamento: a combinar.'
  ];
  conditions.forEach((text, i) => doc.text(`• ${text}`, margin + 2, y + 4 + i * 3));
  if (quote.notes) {
    doc.setFont('helvetica','bold');
    doc.text('Observações:', margin, y + 18);
    doc.setFont('helvetica','normal');
    doc.text(pdfText(quote.notes), margin + 20, y + 18, { maxWidth: 105 });
  }
  doc.setTextColor(...blue);
  doc.setFont('times','italic');
  doc.setFontSize(9);
  doc.text('Obrigado', W - 42, y + 8, { align:'center' });
  doc.text('pela confiança!', W - 42, y + 12, { align:'center' });

  // Critical: never add a page. The document is deliberately composed inside one A4 page.
  doc.save(`ORC-${String(quote.quote_number).padStart(4,'0')}.pdf`);
}

function QuoteDetail({ quote, back, onChanged }) {
  const [saving,setSaving]=useState(false);
  const [status,setStatus]=useState(quote.status);
  const [items,setItems]=useState([]);
  const [company,setCompany]=useState({company_name:'Frios&Clima',document:'',phone:'',whatsapp:'',email:'',address:''});
  const [pdfLoading,setPdfLoading]=useState(false);

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

  async function handlePdf(){
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      await generateQuotePdf({ quote:{...quote,status}, client, items, company });
    } catch (error) {
      console.error(error);
      alert('Não foi possível gerar o PDF. Verifique sua conexão e tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  }

  const client=quote.refrig_clients||{};

  return <div className="content quote-screen">
    <button className="back" onClick={back}><ArrowLeft size={18}/> Voltar para orçamentos</button>
    <PageHead title={`ORC-${String(quote.quote_number).padStart(4,'0')}`} sub="Detalhes do orçamento" action={<div className="actions"><button className="secondary"><Pencil size={17}/> Editar</button><button className="secondary" onClick={handlePdf} disabled={pdfLoading}>{pdfLoading?<LoaderCircle className="spin" size={17}/>:<Download size={17}/>} {pdfLoading?'Gerando PDF…':'PDF'}</button><button className="primary"><MessageCircle size={17}/> WhatsApp</button></div>}/>
    <div className="detail-grid">
      <section className="panel"><div className="panel-head"><div><h2>Cliente</h2><p>Dados do solicitante</p></div><Badge status={status}/></div><div className="info-grid"><Info icon={UserRound} label="Nome" value={client.name||'—'}/><Info icon={Phone} label="Telefone" value={client.phone||'—'}/><Info icon={MapPin} label="Endereço" value={client.address||'—'}/><Info icon={Mail} label="E-mail" value={client.email||'—'}/></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Serviços</h2><p>Composição do orçamento</p></div></div>{items.map(i=><div className="service-line" key={i.id}><div><strong>{i.service_name}</strong><span>{i.quantity} × {i.refrig_equipment?.equipment_type || 'Equipamento'} {i.refrig_equipment?.capacity || ''}</span></div><strong>{money(Number(i.unit_final_value||0)*Number(i.quantity||1))}</strong></div>)}<div className="total"><span>Total</span><strong>{money(quote.total_final)}</strong></div></section>
    </div>
    <section className="panel"><div className="panel-head"><div><h2>Status</h2><p>Atualize o andamento do orçamento.</p></div></div><div className="status-actions">{[['aguardando_resposta','Aguardando resposta'],['aprovado','Aprovar'],['recusado','Recusar'],['em_andamento','Em andamento'],['concluido','Concluir']].map(([id,label])=><button key={id} className={status===id?'selected':''} disabled={saving} onClick={()=>changeStatus(id)}>{label}</button>)}</div></section>
    {quote.notes && <section className="panel"><h2>Observações</h2><p className="note">{quote.notes}</p></section>}
  </div>;
}

function Info({icon:Icon,label,value}){return <div className="info"><Icon size={17}/><div><small>{label}</small><span>{value}</span></div></div>}

function Finance({setSelected,refresh}) { const {quotes,loading}=useQuotes(refresh); const approved=quotes.filter(q=>['aprovado','em_andamento','concluido'].includes(q.status)); const total=approved.reduce((a,q)=>a+Number(q.total_final||0),0); return <div className="content"><PageHead title="Financeiro" sub="Acompanhe os valores dos serviços aprovados."/><div className="finance-cards"><div className="bigmetric"><span>Total aprovado</span><strong>{money(total)}</strong><small>Orçamentos aprovados, em andamento e concluídos.</small></div><div className="bigmetric"><span>Serviços aprovados</span><strong>{approved.length}</strong><small>Chamados vinculados ao orçamento.</small></div></div><div className="tablepanel"><div className="table-title"><div><h2>Movimentações</h2><p>Clique em um item para consultar o orçamento.</p></div></div>{loading?<Loading/>:<table><thead><tr><th>Orçamento</th><th>Cliente</th><th>Data</th><th>Status</th><th>Valor</th></tr></thead><tbody>{approved.map(q=><tr key={q.id} onClick={()=>setSelected(q)}><td><strong>ORC-{String(q.quote_number).padStart(4,'0')}</strong></td><td>{q.refrig_clients?.name||'Cliente'}</td><td>{dateBR(q.issue_date)}</td><td><Badge status={q.status}/></td><td><strong>{money(q.total_final)}</strong></td></tr>)}</tbody></table>}</div></div> }

function Tickets({setSelected,refresh}) { const [tickets,setTickets]=useState([]); const [loading,setLoading]=useState(true); useEffect(()=>{supabase.from('refrig_service_calls').select('*, refrig_quotes(*, refrig_clients(name))').order('created_at',{ascending:false}).then(({data})=>{setTickets(data||[]);setLoading(false);});},[refresh]); return <div className="content"><PageHead title="Chamados" sub="Serviços aprovados e em execução."/><div className="ticket-filters"><button className="selected">Todos <b>{tickets.length}</b></button><button>Aprovados</button><button>Em andamento</button><button>Concluídos</button></div>{loading?<Loading/>:<div className="ticket-list">{tickets.map(t=><div className="ticket" key={t.id} onClick={()=>t.refrig_quotes&&setSelected(t.refrig_quotes)}><div className="ticket-num">CH-{String(t.call_number).padStart(4,'0')}</div><div className="grow"><strong>{t.refrig_quotes?.refrig_clients?.name||'Cliente'}</strong><span>ORC-{String(t.refrig_quotes?.quote_number||0).padStart(4,'0')}</span></div><strong>{money(t.refrig_quotes?.total_final)}</strong><Badge status={t.status==='aprovado'?'aprovado':t.status}/><ChevronRight size={18}/></div>)}{!tickets.length&&<Empty title="Nenhum chamado ainda" text="Um chamado será criado automaticamente quando um orçamento for aprovado."/>}</div>}</div> }

function SettingsPage({refresh}) { const [company,setCompany]=useState({company_name:'',document:'',phone:'',whatsapp:'',email:'',address:''}); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [message,setMessage]=useState(''); useEffect(()=>{supabase.auth.getUser().then(async({data})=>{const {data:row}=await supabase.from('refrig_company').select('*').eq('owner_id',data.user.id).maybeSingle(); if(row)setCompany(row); else setCompany(c=>({...c,email:data.user.email||''}));setLoading(false);});},[]); async function save(){setSaving(true);setMessage('');const {data}=await supabase.auth.getUser();const {error}=await supabase.from('refrig_company').upsert({...company,owner_id:data.user.id},{onConflict:'owner_id'});setMessage(error?error.message:'Dados salvos com sucesso.');setSaving(false);if(!error)refresh();} if(loading)return <div className="content"><Loading/> </div>; return <div className="content"><PageHead title="Configurações" sub="Gerencie os dados que serão usados nos próximos orçamentos e PDFs."/><div className="settings-grid"><section className="panel"><div className="panel-head"><div><h2>Perfil</h2><p>Dados do acesso atual.</p></div></div><label>E-mail<input value={company.email} readOnly/></label><button className="secondary" onClick={()=>supabase.auth.resetPasswordForEmail(company.email,{redirectTo:window.location.origin})}>Redefinir senha</button></section><section className="panel"><div className="panel-head"><div><h2>Dados da empresa</h2><p>Serão utilizados automaticamente nos documentos.</p></div></div>{[['company_name','Nome da empresa'],['document','CNPJ / CPF'],['phone','Telefone'],['whatsapp','WhatsApp'],['address','Endereço']].map(([k,l])=><label key={k}>{l}<input value={company[k]||''} onChange={e=>setCompany({...company,[k]:e.target.value})}/></label>)}{message&&<div className={message.includes('sucesso')?'form-success':'form-error'}>{message}</div>}<button className="primary" onClick={save} disabled={saving}>{saving?<LoaderCircle className="spin" size={18}/>:<Save size={18}/>} Salvar dados</button></section></div></div>; }

createRoot(document.getElementById('root')).render(<App/>);
