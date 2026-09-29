import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, FileText, Wallet, ClipboardList, Settings, LogOut, Menu, X, Plus, Search,
  ChevronRight, Clock3, CheckCircle2, PlayCircle, PackageCheck, MoreHorizontal, Eye, Pencil,
  Copy, Trash2, SlidersHorizontal, UserRound, Building2, Phone, MapPin, Mail, ArrowLeft,
  Download, MessageCircle, AlertCircle, LoaderCircle, Save, UserPlus, LockKeyhole, RefreshCw, Wrench, PlusCircle
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './styles.css';

const nav = [
  ['home', 'Início', LayoutDashboard],
  ['quotes', 'Orçamentos', FileText],
  ['finance', 'Financeiro', Wallet],
  ['tickets', 'Chamados', ClipboardList],
  ['catalog', 'Catálogo de serviços', Wrench],
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
const DEFAULT_COMPANY_NAME = 'Daniel Alves';
const DEFAULT_COMPANY_SUBTITLE = 'Refrigeração';

function safeFileName(value = '') {
  return String(value || 'Cliente').trim().replace(/[\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').replace(/^-+|-+$/g, '') || 'Cliente';
}

function whatsappNumber(value = '') {
  return String(value || '').replace(/\D/g, '');
}

function displayCompanyName(value = '') {
  const name = String(value || '').trim();
  return !name || /frios\s*&\s*clima/i.test(name) ? DEFAULT_COMPANY_NAME : name;
}

const DEFAULT_SERVICE_CATALOG = [
  { name:'Lavagem completa', category:'Limpeza e Higienização', description:'Lavagem completa de ar-condicionado', included:'Lavagem da evaporadora\nLavagem da condensadora\nLimpeza geral dos componentes externos\nHigienização do equipamento', default_price:400 },
  { name:'Limpeza', category:'Limpeza e Higienização', description:'Limpeza de ar-condicionado', included:'Limpeza do equipamento\nLimpeza dos filtros\nLimpeza geral dos componentes', default_price:0 },
  { name:'Higienização', category:'Limpeza e Higienização', description:'Higienização de ar-condicionado', included:'Higienização do equipamento\nLimpeza de componentes internos', default_price:0 },
  { name:'Lavagem química', category:'Limpeza e Higienização', description:'Lavagem química de ar-condicionado', included:'Aplicação de produto adequado\nLimpeza profunda dos componentes\nHigienização do equipamento', default_price:0 },
  { name:'Manutenção preventiva', category:'Manutenção', description:'Manutenção preventiva de ar-condicionado', included:'Inspeção geral\nLimpeza dos componentes\nVerificação de funcionamento', default_price:0 },
  { name:'Manutenção corretiva', category:'Manutenção', description:'Manutenção corretiva de ar-condicionado', included:'Diagnóstico do equipamento\nIdentificação da falha\nCorreção do problema conforme necessidade', default_price:0 },
  { name:'Diagnóstico técnico', category:'Visita Técnica', description:'Diagnóstico técnico de ar-condicionado', included:'Avaliação do equipamento\nIdentificação de falhas\nOrientação sobre o serviço necessário', default_price:0 },
  { name:'Visita técnica', category:'Visita Técnica', description:'Visita técnica', included:'Deslocamento até o local\nAvaliação inicial do equipamento', default_price:0 },
  { name:'Carga de gás', category:'Gás Refrigerante', description:'Carga de gás refrigerante', included:'Verificação do sistema\nCarga de gás conforme necessidade\nTeste de funcionamento', default_price:0 },
  { name:'Teste de vazamento', category:'Gás Refrigerante', description:'Teste de vazamento do sistema', included:'Inspeção das conexões\nTeste de vazamento\nIdentificação do ponto de fuga', default_price:0 },
  { name:'Reparo de vazamento', category:'Gás Refrigerante', description:'Reparo de vazamento de gás', included:'Identificação do vazamento\nReparo do ponto de fuga\nTeste do sistema', default_price:0 },
  { name:'Instalação', category:'Instalação', description:'Instalação de ar-condicionado', included:'Fixação do equipamento\nConexões e drenagem\nTeste de funcionamento', default_price:0 },
  { name:'Desinstalação', category:'Retirada / Mudança', description:'Desinstalação de ar-condicionado', included:'Desligamento do equipamento\nRetirada técnica\nOrganização do local', default_price:0 },
  { name:'Reinstalação', category:'Instalação', description:'Reinstalação de ar-condicionado', included:'Instalação do equipamento\nConexões e drenagem\nTeste de funcionamento', default_price:0 },
  { name:'Reparo', category:'Reparos', description:'Reparo de ar-condicionado', included:'Diagnóstico\nReparo do componente necessário\nTeste de funcionamento', default_price:0 },
];

const serviceCategories = ['Limpeza e Higienização','Manutenção','Gás Refrigerante','Instalação','Retirada / Mudança','Reparos','Visita Técnica','Outros'];



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
      <div className="auth-brand"><div className="brandmark">D</div><div><strong>{DEFAULT_COMPANY_NAME}</strong><small>{DEFAULT_COMPANY_SUBTITLE}</small></div></div>
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
  const [editingQuote, setEditingQuote] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  const go = (p) => { setPage(p); setSelected(null); setEditingQuote(null); setMobile(false); };
  const openEdit = (quote) => { setEditingQuote(quote); setSelected(null); setPage('editQuote'); setMobile(false); };
  const refreshData = () => setRefresh(v => v + 1);

  if (checking) return <Loading label="Conectando..." />;
  if (!session) return <Auth onAuth={setSession} />;

  return <div className="app">
    <aside className={`sidebar ${mobile ? 'open' : ''}`}>
      <div className="brand"><div className="brandmark">D</div><div><strong>{DEFAULT_COMPANY_NAME}</strong><small>{DEFAULT_COMPANY_SUBTITLE}</small></div><button className="close" onClick={() => setMobile(false)}><X size={20}/></button></div>
      <div className="profile"><div className="avatar">DA</div><div><strong>{session.user.user_metadata?.full_name || DEFAULT_COMPANY_NAME}</strong><small>Administrador</small></div></div>
      <nav>{nav.map(([id, label, Icon]) => <button key={id} className={page === id && !selected ? 'active' : ''} onClick={() => go(id)}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button onClick={() => supabase.auth.signOut()}><LogOut size={18}/> Sair</button></div>
    </aside>
    {mobile && <div className="overlay" onClick={() => setMobile(false)} />}
    <main className="main">
      <header><button className="menu" onClick={() => setMobile(true)}><Menu/></button><div className="header-search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar orçamento, cliente..."/></div></header>
      {selected ? <QuoteDetail quote={selected} back={() => setSelected(null)} onChanged={refreshData} onEdit={openEdit} /> : page === 'newQuote' ? <NewQuote go={go} /> : page === 'editQuote' ? <NewQuote go={go} quote={editingQuote} /> : page === 'home' ? <Home go={go} setSelected={setSelected} refresh={refresh} /> : page === 'quotes' ? <Quotes search={search} setSelected={setSelected} go={go} refresh={refresh} /> : page === 'finance' ? <Finance setSelected={setSelected} refresh={refresh} /> : page === 'tickets' ? <Tickets setSelected={setSelected} refresh={refresh} /> : page === 'catalog' ? <ServiceCatalog refresh={refreshData} /> : <SettingsPage refresh={refreshData} />}
    </main>
  </div>;
}

function PageHead({ title, sub, action }) { return <div className="pagehead"><div><h1>{title}</h1><p>{sub}</p></div>{action}</div>; }

function useQuotes(refresh) {
  const [quotes, setQuotes] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { let alive = true; (async () => { setLoading(true); const { data, error } = await supabase.from('refrig_quotes').select('*, refrig_clients(name, document, phone, whatsapp, email, address)').order('created_at', { ascending: false }); if (alive) { setQuotes(data || []); setError(error?.message || ''); setLoading(false); } })(); return () => { alive = false; }; }, [refresh]);
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
  return <div className="content"><PageHead title={`Olá, ${DEFAULT_COMPANY_NAME} 👋`} sub="Acompanhe seus orçamentos e serviços de hoje." action={<button className="primary" onClick={() => go('newQuote')}><Plus size={18}/> Novo orçamento</button>}/>
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


function NewQuote({ go, quote = null }) {
  const [client, setClient] = useState({ name:'', document:'', phone:'', whatsapp:'', email:'', address:'', notes:'' });
  const [equipment, setEquipment] = useState([{ type:'', brand:'', model:'', capacity:'', observation:'' }]);
  const [items, setItems] = useState([{ equipmentIndex:0, service_catalog_id:'', service_name:'', service_description:'', included:'', quantity:1, original:'', discount:'', final:'' }]);
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [saving, setSaving] = useState(false); const [loadingEdit, setLoadingEdit] = useState(Boolean(quote)); const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    supabase.from('refrig_service_catalog').select('*').eq('active', true).order('category').order('name').then(({data, error:catalogError})=>{
      if(!alive) return;
      if(catalogError){ console.warn('Catálogo indisponível:', catalogError.message); setCatalog(DEFAULT_SERVICE_CATALOG.map((x,i)=>({...x,id:`default-${i}`,active:true}))); }
      else setCatalog((data && data.length) ? data : DEFAULT_SERVICE_CATALOG.map((x,i)=>({...x,id:`default-${i}`,active:true})));
      setCatalogLoading(false);
    });
    return ()=>{alive=false;};
  }, []);

  useEffect(() => {
    let alive = true;
    if (!quote) { setLoadingEdit(false); return () => { alive = false; }; }
    (async () => {
      setLoadingEdit(true);
      const { data, error: itemError } = await supabase.from('refrig_quote_items')
        .select('*, refrig_equipment(id,equipment_type,brand,model,capacity,observation)')
        .eq('quote_id', quote.id)
        .order('created_at', { ascending: true });
      if (!alive) return;
      if (itemError) { setError(itemError.message); setLoadingEdit(false); return; }
      const clientData = quote.refrig_clients || {};
      setClient({
        name: clientData.name || '', document: clientData.document || clientData.cpf_cnpj || clientData.cpf || clientData.cnpj || '',
        phone: clientData.phone || '', whatsapp: clientData.whatsapp || '',
        email: clientData.email || '', address: clientData.address || '', notes: quote.notes || ''
      });
      const equipmentMap = new Map();
      (data || []).forEach(row => {
        const e = row.refrig_equipment || {};
        if (!equipmentMap.has(row.equipment_id)) equipmentMap.set(row.equipment_id, {
          id: row.equipment_id, type:e.equipment_type || '', brand:e.brand || '', model:e.model || '', capacity:e.capacity || '', observation:e.observation || ''
        });
      });
      const eqs = Array.from(equipmentMap.values());
      const indexById = new Map(eqs.map((e,i) => [e.id, i]));
      setEquipment(eqs.length ? eqs : [{ type:'', brand:'', model:'', capacity:'', observation:'' }]);
      setItems((data || []).map(row => ({
        id: row.id, equipmentIndex:indexById.get(row.equipment_id) ?? 0, service_name:row.service_name || '',
        service_catalog_id: catalog.find(s=>s.name===row.service_name)?.id || '', service_description:row.service_description || '', included:row.included || '', quantity:Number(row.quantity || 1), original:String(row.unit_original_value ?? ''),
        discount:String(row.unit_discount ?? ''), final:String(row.unit_final_value ?? '')
      })));
      setLoadingEdit(false);
    })();
    return () => { alive = false; };
  }, [quote]);

  useEffect(() => {
    if (!catalog.length || !items.length) return;
    setItems(prev => prev.map(item => {
      const service = catalog.find(s => s.name === item.service_name);
      return service ? { ...item, service_catalog_id: item.service_catalog_id || service.id, service_description: item.service_description || service.description || '', included: item.included || service.included || '' } : item;
    }));
  }, [catalog.length]);

  const applyCatalogService = (index, serviceId) => {
    const selectedService = catalog.find(s => String(s.id) === String(serviceId));
    if (!selectedService) return;
    setItems(items.map((it,idx)=>idx===index ? {
      ...it,
      service_catalog_id: selectedService.id,
      service_name: selectedService.name,
      service_description: selectedService.description || '',
      included: selectedService.included || '',
      original: selectedService.default_price ? String(selectedService.default_price) : '',
      final: selectedService.default_price ? String(selectedService.default_price) : ''
    } : it));
  };

  const addEquipment = () => {
    const next = [...equipment, {type:'',brand:'',model:'',capacity:'',observation:''}];
    setEquipment(next);
    setItems([...items, { equipmentIndex: next.length-1, service_catalog_id:'', service_name:'', service_description:'', included:'', quantity:1, original:'', discount:'', final:'' }]);
  };
  const addItem = () => setItems([...items, { equipmentIndex:0, service_catalog_id:'', service_name:'', service_description:'', included:'', quantity:1, original:'', discount:'', final:'' }]);
  const updateEquipment = (i,key,value) => setEquipment(equipment.map((e,idx)=>idx===i?{...e,[key]:value}:e));
  const updateItem = (i,key,value) => setItems(items.map((it,idx)=>idx===i?{...it,[key]:value}:it));
  const total = items.reduce((sum,it)=>sum + Number(it.quantity||0) * Number(it.final||0), 0);

  async function save() {
    setError('');
    if (!client.name.trim()) return setError('Informe o nome do cliente.');
    if (equipment.some(e => !e.type.trim())) return setError('Informe o tipo de todos os equipamentos.');
    if (!items.length || items.some(i => !i.service_name.trim() || !i.final)) return setError('Informe o serviço e o valor final de cada item.');
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const owner_id = auth.user.id;
      if (!quote) {
        const { data: c, error: ce } = await supabase.from('refrig_clients').insert({ owner_id, ...client }).select().single(); if (ce) throw ce;
        const { data: eq, error: ee } = await supabase.from('refrig_equipment').insert(equipment.map(e => ({ owner_id, client_id:c.id, equipment_type:e.type, brand:e.brand, model:e.model, capacity:e.capacity, observation:e.observation }))).select().order('created_at'); if (ee) throw ee;
        const { data: q, error: qe } = await supabase.from('refrig_quotes').insert({ owner_id, client_id:c.id, notes:client.notes, total_original:items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.original||0),0), total_discount:items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.discount||0),0), total_final:total }).select().single(); if (qe) throw qe;
        const rows = items.map(i => ({ quote_id:q.id, equipment_id:eq[i.equipmentIndex].id, service_name:i.service_name, service_description:i.service_description, included:i.included || '', quantity:Number(i.quantity||1), unit_original_value:Number(i.original||0), unit_discount:Number(i.discount||0), unit_final_value:Number(i.final||0) }));
        const { error: ie } = await supabase.from('refrig_quote_items').insert(rows); if (ie) throw ie;
      } else {
        const { error: ce } = await supabase.from('refrig_clients').update(client).eq('id', quote.client_id); if (ce) throw ce;
        const { data: currentEq, error: eqReadError } = await supabase.from('refrig_equipment').select('id').eq('client_id', quote.client_id); if (eqReadError) throw eqReadError;
        const existingIds = new Set((currentEq || []).map(e => e.id));
        const keepIds = new Set(equipment.filter(e => e.id).map(e => e.id));
        const { error: deleteItemsError } = await supabase.from('refrig_quote_items').delete().eq('quote_id', quote.id); if (deleteItemsError) throw deleteItemsError;
        for (const e of equipment) {
          if (e.id) {
            const { error } = await supabase.from('refrig_equipment').update({ equipment_type:e.type, brand:e.brand, model:e.model, capacity:e.capacity, observation:e.observation }).eq('id',e.id); if (error) throw error;
          } else {
            const { data: inserted, error } = await supabase.from('refrig_equipment').insert({ owner_id, client_id:quote.client_id, equipment_type:e.type, brand:e.brand, model:e.model, capacity:e.capacity, observation:e.observation }).select().single(); if (error) throw error;
            e.id = inserted.id;
          }
        }
        for (const id of existingIds) if (!keepIds.has(id)) { const { error } = await supabase.from('refrig_equipment').delete().eq('id',id); if (error) throw error; }
        const { error: qe } = await supabase.from('refrig_quotes').update({ notes:client.notes, total_original:items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.original||0),0), total_discount:items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.discount||0),0), total_final:total }).eq('id',quote.id); if (qe) throw qe;
        const rows = items.map(i => ({ quote_id:quote.id, equipment_id:equipment[i.equipmentIndex].id, service_name:i.service_name, service_description:i.service_description, included:i.included || '', quantity:Number(i.quantity||1), unit_original_value:Number(i.original||0), unit_discount:Number(i.discount||0), unit_final_value:Number(i.final||0) }));
        const { error: ie } = await supabase.from('refrig_quote_items').insert(rows); if (ie) throw ie;
      }
      go('quotes');
    } catch (e) { setError(e.message || 'Não foi possível salvar o orçamento.'); }
    finally { setSaving(false); }
  }

  if (loadingEdit) return <div className="content"><Loading label="Carregando orçamento..."/></div>;
  return <div className="content"><button className="back" onClick={() => go('quotes')}><ArrowLeft size={18}/> Voltar</button><PageHead title={quote ? `Editar ORC-${String(quote.quote_number).padStart(4,'0')}` : 'Criar orçamento'} sub="Monte uma proposta com serviços e valores por equipamento." />{error&&<div className="form-error">{error}</div>}
    <section className="panel form-section"><div className="panel-head"><div><h2>1. Cliente</h2><p>Quem receberá o orçamento.</p></div></div><div className="form-grid">{[['name','Nome','text'],['document','CPF / CNPJ','text'],['phone','Telefone','text'],['whatsapp','WhatsApp','text'],['email','E-mail','email'],['address','Endereço','text']].map(([k,l,t])=><label key={k}>{l}<input type={t} value={client[k]||''} onChange={e=>setClient({...client,[k]:e.target.value})} placeholder={k==='document'?'000.000.000-00 ou 00.000.000/0000-00':''}/></label>)}</div><label>Observações<textarea value={client.notes} onChange={e=>setClient({...client,notes:e.target.value})}/></label></section>
    <section className="panel form-section"><div className="panel-head"><div><h2>2. Equipamentos</h2><p>Cadastre cada equipamento que receberá serviço.</p></div><button className="secondary" onClick={addEquipment}><Plus size={16}/> Adicionar equipamento</button></div>{equipment.map((e,i)=><div className="equipment-form" key={e.id || i}><div className="mini-index">{String(i+1).padStart(2,'0')}</div><div className="form-grid equipment-fields"><label>Tipo*<input value={e.type} onChange={ev=>updateEquipment(i,'type',ev.target.value)} placeholder="Ex.: Piso-Teto"/></label><label>Marca<input value={e.brand} onChange={ev=>updateEquipment(i,'brand',ev.target.value)}/></label><label>Modelo<input value={e.model} onChange={ev=>updateEquipment(i,'model',ev.target.value)}/></label><label>Capacidade<input value={e.capacity} onChange={ev=>updateEquipment(i,'capacity',ev.target.value)} placeholder="60.000 BTU"/></label></div></div>)}</section>
    <section className="panel form-section"><div className="panel-head"><div><h2>3. Serviços</h2><p>O mesmo equipamento pode ter vários serviços e cada combinação tem seu próprio preço.</p></div><button className="secondary" onClick={addItem}><Plus size={16}/> Adicionar serviço</button></div>{items.map((it,i)=><div className="service-editor" key={it.id || i}><div className="service-editor-head"><strong>Serviço {String(i+1).padStart(2,'0')}</strong><button className="iconbtn" onClick={()=>setItems(items.filter((_,idx)=>idx!==i))} disabled={items.length===1}><Trash2 size={17}/></button></div><div className="form-grid"><label>Equipamento<select value={it.equipmentIndex} onChange={e=>updateItem(i,'equipmentIndex',Number(e.target.value))}>{equipment.map((e,idx)=><option key={e.id || idx} value={idx}>{idx+1}. {e.type||'Equipamento'}</option>)}</select></label><label>Serviço*
<select value={it.service_catalog_id || (it.service_name && !catalog.some(s=>s.name===it.service_name) ? `legacy:${it.service_name}` : '')} onChange={e=>{ if(e.target.value.startsWith('legacy:')) updateItem(i,'service_catalog_id',''); else if(e.target.value) applyCatalogService(i,e.target.value); else updateItem(i,'service_catalog_id',''); }} disabled={catalogLoading}>
<option value="">{catalogLoading?'Carregando serviços…':'Selecione um serviço'}</option>
{it.service_name && !catalog.some(s=>s.name===it.service_name) && <option value={`legacy:${it.service_name}`}>{it.service_name} · serviço atual</option>}
{catalog.map(s=><option key={s.id} value={s.id}>{s.category ? `${s.category} · ` : ''}{s.name}</option>)}
</select>
{it.service_name && <small className="field-hint">{it.service_description || 'Serviço selecionado no catálogo.'}</small>}
</label><label>Quantidade<input type="number" min="1" value={it.quantity} onChange={e=>updateItem(i,'quantity',e.target.value)}/></label><label>Valor original<input type="number" step="0.01" value={it.original} onChange={e=>updateItem(i,'original',e.target.value)}/></label><label>Desconto<input type="number" step="0.01" value={it.discount} onChange={e=>updateItem(i,'discount',e.target.value)}/></label><label>Valor final*<input type="number" step="0.01" value={it.final} onChange={e=>updateItem(i,'final',e.target.value)}/></label></div>{it.included&&<div className="service-included-preview"><strong>Incluso no serviço</strong><span>{it.included}</span></div>}<div className="item-total">Total do item <strong>{money(Number(it.quantity||0)*Number(it.final||0))}</strong></div></div>)}</section>
    <section className="panel total-box"><span>Total do orçamento</span><strong>{money(total)}</strong></section>
    <div className="quote-save-footer">
      <button className="secondary" onClick={() => go('quotes')} disabled={saving}>Cancelar</button>
      <button className="primary" onClick={save} disabled={saving}>
        {saving?<LoaderCircle className="spin" size={18}/>:<Save size={18}/>}
        {saving?'Salvando…':quote?'Salvar alterações':'Salvar orçamento'}
      </button>
    </div>
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

async function generateQuotePdf({ quote, client, items, company, download = true }) {
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
  const companyName = pdfText(displayCompanyName(company?.company_name));
  const fileClientName = safeFileName(client?.name || 'Cliente');
  const total = Number(quote.total_final || 0);

  // Header — identidade limpa, sem box ao lado do nome
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(companyName, margin, 16);
  doc.setFontSize(5.5);
  doc.setTextColor(...muted);
  doc.text('REFRIGERAÇÃO', margin, 20);

  doc.setTextColor(...blue);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORÇAMENTO Nº ${String(quote.quote_number).padStart(4,'0')}`, W - margin, 14.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.setFontSize(6.5);
  doc.text(`Data: ${dateBR(issueDate)}`, W - margin, 18, { align:'right' });
  doc.text(`Validade: ${validity} dias`, W - margin, 21, { align:'right' });

  doc.setDrawColor(...line);
  doc.line(margin, 25, W - margin, 25);

  // Cliente / contato — cada informação aparece uma única vez
  const halfX = margin + contentW / 2 + 4;
  const clientBlockW = contentW / 2 - 8;
  const clientDocument = client?.document || client?.cpf_cnpj || client?.cpf || client?.cnpj || '';

  doc.setTextColor(...blue);
  doc.setFont('helvetica','bold');
  doc.setFontSize(6.5);
  doc.text('CLIENTE', margin, 31);
  doc.text('CONTATO', halfX, 31);

  // Divisor visual discreto entre os dois blocos
  doc.setDrawColor(219,234,254);
  doc.setLineWidth(0.7);
  doc.line(margin + contentW/2, 30, margin + contentW/2, 47);
  doc.setLineWidth(0.2);

  // CLIENTE: nome, CPF/CNPJ e endereço
  doc.setTextColor(...dark);
  doc.setFont('helvetica','bold');
  doc.setFontSize(7.5);
  doc.text(pdfText(client?.name || '—'), margin, 35, { maxWidth: clientBlockW });

  doc.setFont('helvetica','normal');
  doc.setTextColor(...muted);
  doc.setFontSize(6.5);
  let clientY = 39;
  if (clientDocument) {
    doc.text(`CPF/CNPJ: ${pdfText(clientDocument)}`, margin, clientY, { maxWidth: clientBlockW });
    clientY += 4;
  }
  if (client?.address) {
    const addressLines = doc.splitTextToSize(pdfText(client.address), clientBlockW);
    doc.text(addressLines.slice(0, 2), margin, clientY);
  }

  // CONTATO: telefone, WhatsApp e e-mail — sem repetir no bloco CLIENTE
  const contactLines = [
    client?.phone ? `Telefone: ${client.phone}` : '',
    client?.whatsapp ? `WhatsApp: ${client.whatsapp}` : '',
    client?.email ? `E-mail: ${client.email}` : ''
  ].filter(Boolean);

  let cy = 35;
  contactLines.slice(0, 3).forEach(value => {
    doc.text(pdfText(value), halfX, cy, { maxWidth: clientBlockW });
    cy += 4;
  });

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
      columnStyles: { 0:{cellWidth:8,halign:'center'}, 1:{cellWidth:35}, 2:{cellWidth:45}, 3:{cellWidth:32}, 4:{cellWidth:66} },
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
      columnStyles: { 0:{cellWidth:58}, 1:{cellWidth:11,halign:'center'}, 2:{cellWidth:31,halign:'right'}, 3:{cellWidth:28,halign:'right'}, 4:{cellWidth:29,halign:'right'}, 5:{cellWidth:29,halign:'right',fontStyle:'bold'} },
      didDrawPage: () => {}
    });
    y = doc.lastAutoTable.finalY + 2.5;
    const subtotal = group.items.reduce((sum,i) => sum + Number(i.quantity || 1) * Number(i.unit_final_value || 0), 0);
    doc.setTextColor(...muted);
    doc.setFont('helvetica','normal');
    doc.setFontSize(5.8);
    // Subtotal alinhado ao mesmo eixo da coluna TOTAL, sem deslocamentos artificiais.
    doc.setTextColor(...muted);
    doc.setFont('helvetica','normal');
    doc.setFontSize(5.8);
    doc.text('Subtotal do serviço', W - margin - 34, y, { align:'right' });
    doc.setTextColor(...dark);
    doc.setFont('helvetica','bold');
    doc.setFontSize(6.4);
    doc.text(pdfMoney(subtotal), W - margin, y, { align:'right' });
    y += 5;

    const includedText = String(group.items.find(i => i.included)?.included || '').trim();
    if (includedText) {
      const includedLines = includedText.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
      const boxH = Math.max(8, 5 + includedLines.length * 3.1);
      doc.setFillColor(247,250,253);
      doc.setDrawColor(224,232,241);
      doc.roundedRect(margin, y, contentW, boxH, 1.2, 1.2, 'FD');
      doc.setTextColor(...blue);
      doc.setFont('helvetica','bold');
      doc.setFontSize(5.9);
      doc.text('INCLUSO NO SERVIÇO', margin + 4, y + 4);
      doc.setTextColor(...muted);
      doc.setFont('helvetica','normal');
      doc.setFontSize(5.4);
      includedLines.forEach((line, idx) => {
        doc.text(`• ${pdfText(line)}`, margin + 4, y + 7.2 + idx * 3.1, { maxWidth: contentW - 8 });
      });
      y += boxH + 3.5;
    }
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
  const fileName = `ORC-${String(quote.quote_number).padStart(4,'0')} - ${fileClientName}.pdf`;
  const blob = doc.output('blob');
  if (download) doc.save(fileName);
  return { blob, fileName };
}

function QuoteDetail({ quote, back, onChanged, onEdit }) {
  const [saving,setSaving]=useState(false);
  const [status,setStatus]=useState(quote.status);
  const [items,setItems]=useState([]);
  const [company,setCompany]=useState({company_name:DEFAULT_COMPANY_NAME,document:'',phone:'',whatsapp:'',email:'',address:''});
  const [pdfLoading,setPdfLoading]=useState(false);
  const [actionsOpen,setActionsOpen]=useState(false);
  const [deleting,setDeleting]=useState(false);

  useEffect(()=>{
    let alive=true;
    supabase.from('refrig_quote_items').select('*, refrig_equipment(equipment_type,brand,model,capacity,observation)').eq('quote_id',quote.id).then(({data})=>{if(alive)setItems(data||[]);});
    supabase.auth.getUser().then(async({data})=>{
      if(!data.user || !alive) return;
      const {data:row}=await supabase.from('refrig_company').select('*').eq('owner_id',data.user.id).maybeSingle();
      if(row && alive) setCompany({...row,company_name:displayCompanyName(row.company_name)});
    });
    return ()=>{alive=false;};
  },[quote.id]);

  async function changeStatus(next){
    setSaving(true);
    const {error}=await supabase.from('refrig_quotes').update({status:next}).eq('id',quote.id);
    if(!error){setStatus(next);onChanged();} else alert(error.message);
    setSaving(false);
  }

  async function getItemsForPdf(){
    const {data:userData}=await supabase.auth.getUser();
    const ownerId=userData?.user?.id;
    if(!ownerId) return items;
    const {data:catalogRows}=await supabase.from('refrig_service_catalog').select('name,included').eq('owner_id',ownerId);
    const byName=new Map((catalogRows||[]).map(row=>[row.name,row.included||'']));
    return items.map(item=>({ ...item, included:item.included || byName.get(item.service_name) || '' }));
  }

  async function handlePdf(){
    if(pdfLoading)return;
    setPdfLoading(true);
    try{const pdfItems=await getItemsForPdf(); await generateQuotePdf({quote:{...quote,status},client,items:pdfItems,company});}
    catch(error){console.error(error);alert('Não foi possível gerar o PDF. Verifique sua conexão e tente novamente.');}
    finally{setPdfLoading(false);setActionsOpen(false);}
  }

  async function handleWhatsApp(){
    const number=whatsappNumber(client.whatsapp || client.phone);
    if(!number){alert('Este cliente não possui telefone ou WhatsApp cadastrado.');return;}
    const quoteNo=`ORC-${String(quote.quote_number).padStart(4,'0')}`;
    const validity=quote.validity_days || 7;
    const message=`Olá, ${client.name || 'tudo bem'}! Tudo bem?\n\nSegue em anexo o orçamento ${quoteNo}, referente aos serviços solicitados, no valor total de ${money(quote.total_final)}.\n\nO orçamento é válido por ${validity} dias. Em caso de dúvidas ou para aprovação, fico à disposição.\n\n${displayCompanyName(company.company_name)} | Refrigeração`;
    setActionsOpen(false);
    try{
      const pdfItems=await getItemsForPdf();
      const {blob,fileName}=await generateQuotePdf({quote:{...quote,status},client,items:pdfItems,company,download:false});
      const file=new File([blob],fileName,{type:'application/pdf'});
      if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({
          files:[file],
          text:message,
          title:`Orçamento ${quoteNo}`
        });
        return;
      }
      // Desktop/browsers without file sharing: download the PDF and open WhatsApp with the prepared message.
      const url=URL.createObjectURL(blob);
      const anchor=document.createElement('a');
      anchor.href=url;
      anchor.download=fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer');
      alert('O PDF foi baixado e a mensagem foi preparada no WhatsApp. Anexe o PDF baixado à conversa.');
    }catch(error){
      if(error?.name==='AbortError') return;
      console.error(error);
      alert('Não foi possível preparar o envio pelo WhatsApp. Tente gerar o PDF e enviá-lo manualmente.');
    }
  }

  async function handleDelete(){
    if(deleting)return;
    const quoteNo=`ORC-${String(quote.quote_number).padStart(4,'0')}`;
    const confirmed=window.confirm(`Excluir o ${quoteNo}?\n\nEssa ação é permanente e removerá o orçamento e os itens vinculados. Não será possível desfazer.`);
    if(!confirmed){setActionsOpen(false);return;}
    setDeleting(true);
    try{
      const {error:callError}=await supabase.from('refrig_service_calls').delete().eq('quote_id',quote.id);
      if(callError)throw callError;
      const {error:itemError}=await supabase.from('refrig_quote_items').delete().eq('quote_id',quote.id);
      if(itemError)throw itemError;
      const {error:quoteError}=await supabase.from('refrig_quotes').delete().eq('id',quote.id);
      if(quoteError)throw quoteError;
      onChanged();
      setActionsOpen(false);
      back();
    }catch(error){
      console.error(error);
      alert(`Não foi possível excluir o orçamento.\n\n${error.message || 'Verifique as permissões do banco de dados.'}`);
    }finally{
      setDeleting(false);
    }
  }

  const client=quote.refrig_clients||{};
  return <div className="content quote-screen">
    <button className="back" onClick={back}><ArrowLeft size={18}/> Voltar para orçamentos</button>
    <PageHead title={`ORC-${String(quote.quote_number).padStart(4,'0')}`} sub="Detalhes do orçamento" action={
      <div className="quote-detail-actions">
        <button className="secondary" onClick={()=>onEdit(quote)}><Pencil size={16}/> Editar</button>
        <button className="secondary" onClick={handlePdf} disabled={pdfLoading}>{pdfLoading?<LoaderCircle className="spin" size={16}/>:<Download size={16}/>} {pdfLoading?'Gerando…':'Gerar PDF'}</button>
        <button className="secondary" onClick={handleWhatsApp}><MessageCircle size={16}/> WhatsApp</button>
        <button className="danger-outline" onClick={handleDelete} disabled={deleting}><Trash2 size={16}/> {deleting?'Excluindo…':'Excluir'}</button>
      </div>
    }/>
    <div className="detail-grid">
      <section className="panel"><div className="panel-head"><div><h2>Cliente</h2><p>Dados do solicitante</p></div><Badge status={status}/></div><div className="info-grid"><Info icon={UserRound} label="Nome" value={client.name||'—'}/><Info icon={FileText} label="CPF / CNPJ" value={client.document||client.cpf_cnpj||client.cpf||client.cnpj||'—'}/><Info icon={Phone} label="Telefone" value={client.phone||'—'}/><Info icon={MessageCircle} label="WhatsApp" value={client.whatsapp||'—'}/><Info icon={MapPin} label="Endereço" value={client.address||'—'}/><Info icon={Mail} label="E-mail" value={client.email||'—'}/></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Serviços</h2><p>Composição do orçamento</p></div></div>{items.map(i=><div className="service-line" key={i.id}><div><strong>{i.service_name}</strong><span>{i.quantity} × {i.refrig_equipment?.equipment_type || 'Equipamento'} {i.refrig_equipment?.capacity || ''}</span></div><strong>{money(Number(i.unit_final_value||0)*Number(i.quantity||1))}</strong></div>)}<div className="total"><span>Total</span><strong>{money(quote.total_final)}</strong></div></section>
    </div>
    <section className="panel"><div className="panel-head"><div><h2>Status</h2><p>Atualize o andamento do orçamento.</p></div></div><div className="status-actions">{[['aguardando_resposta','Aguardando resposta'],['aprovado','Aprovar'],['recusado','Recusar'],['em_andamento','Em andamento'],['concluido','Concluir']].map(([id,label])=><button key={id} className={status===id?'selected':''} disabled={saving} onClick={()=>changeStatus(id)}>{label}</button>)}</div></section>
    {quote.notes && <section className="panel"><h2>Observações</h2><p className="note">{quote.notes}</p></section>}
  </div>;
}

function Info({icon:Icon,label,value}){return <div className="info"><Icon size={17}/><div><small>{label}</small><span>{value}</span></div></div>}

function Finance({setSelected,refresh}) {
  const {quotes,loading}=useQuotes(refresh);
  const approved=quotes.filter(q=>['aprovado','em_andamento','concluido'].includes(q.status));
  const total=approved.reduce((a,q)=>a+Number(q.total_final||0),0);
  return <div className="content finance-page"><PageHead title="Financeiro" sub="Acompanhe os valores dos serviços aprovados."/><div className="finance-cards"><div className="bigmetric"><span>Total aprovado</span><strong>{money(total)}</strong><small>Orçamentos aprovados, em andamento e concluídos.</small></div><div className="bigmetric"><span>Serviços aprovados</span><strong>{approved.length}</strong><small>Chamados vinculados ao orçamento.</small></div></div><div className="tablepanel finance-tablepanel"><div className="table-title"><div><h2>Movimentações</h2><p>Clique em um item para consultar o orçamento.</p></div></div>{loading?<Loading/>:<><table><thead><tr><th>Orçamento</th><th>Cliente</th><th>Data</th><th>Status</th><th>Valor</th></tr></thead><tbody>{approved.map(q=><tr key={q.id} onClick={()=>setSelected(q)}><td><strong>ORC-{String(q.quote_number).padStart(4,'0')}</strong></td><td>{q.refrig_clients?.name||'Cliente'}</td><td>{dateBR(q.issue_date)}</td><td><Badge status={q.status}/></td><td><strong>{money(q.total_final)}</strong></td></tr>)}</tbody></table><div className="finance-mobile-list">{approved.map(q=><div className="finance-mobile-card" key={q.id} onClick={()=>setSelected(q)}><div><strong>ORC-{String(q.quote_number).padStart(4,'0')}</strong><Badge status={q.status}/></div><h3>{q.refrig_clients?.name||'Cliente'}</h3><p>{dateBR(q.issue_date)}</p><strong>{money(q.total_final)}</strong></div>)}{!approved.length&&<Empty title="Nenhum orçamento aprovado" text="Os orçamentos aprovados aparecerão aqui."/>}</div></>}</div></div>;
}

function Tickets({setSelected,refresh}) { const [tickets,setTickets]=useState([]); const [loading,setLoading]=useState(true); useEffect(()=>{supabase.from('refrig_service_calls').select('*, refrig_quotes(*, refrig_clients(name, document, phone, whatsapp, email, address))').order('created_at',{ascending:false}).then(({data})=>{setTickets(data||[]);setLoading(false);});},[refresh]); return <div className="content"><PageHead title="Chamados" sub="Serviços aprovados e em execução."/><div className="ticket-filters"><button className="selected">Todos <b>{tickets.length}</b></button><button>Aprovados</button><button>Em andamento</button><button>Concluídos</button></div>{loading?<Loading/>:<div className="ticket-list">{tickets.map(t=><div className="ticket" key={t.id} onClick={()=>t.refrig_quotes&&setSelected(t.refrig_quotes)}><div className="ticket-num">CH-{String(t.call_number).padStart(4,'0')}</div><div className="grow"><strong>{t.refrig_quotes?.refrig_clients?.name||'Cliente'}</strong><span>ORC-{String(t.refrig_quotes?.quote_number||0).padStart(4,'0')}</span></div><strong>{money(t.refrig_quotes?.total_final)}</strong><Badge status={t.status==='aprovado'?'aprovado':t.status}/><ChevronRight size={18}/></div>)}{!tickets.length&&<Empty title="Nenhum chamado ainda" text="Um chamado será criado automaticamente quando um orçamento for aprovado."/>}</div>}</div> }

function ServiceCatalog({refresh}) {
  const [services,setServices]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [editing,setEditing]=useState(null);
  const [saving,setSaving]=useState(false);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('Todos');

  async function load(){
    setLoading(true); setError('');
    const {data:userData}=await supabase.auth.getUser();
    const ownerId=userData?.user?.id;
    const {data,error:err}=await supabase.from('refrig_service_catalog').select('*').eq('owner_id',ownerId).order('category').order('name');
    if(err){setError(err.message);setServices([]);setLoading(false);return;}
    if(ownerId && !(data||[]).length){
      const seed=DEFAULT_SERVICE_CATALOG.map(service=>({...service,owner_id:ownerId,active:true}));
      const {data:created,error:seedError}=await supabase.from('refrig_service_catalog').insert(seed).select('*');
      if(seedError){setError(seedError.message);setServices([]);} else setServices(created||[]);
    } else setServices(data||[]);
    setLoading(false);
  }
  useEffect(()=>{load();},[]);

  function startNew(){setEditing({name:'',category:'Outros',description:'',included:'',default_price:'',active:true});}
  function startEdit(service){setEditing({...service,default_price:service.default_price ?? ''});}

  async function saveService(){
    if(!editing.name.trim()) return setError('Informe o nome do serviço.');
    setSaving(true); setError('');
    try{
      const {data:user}=await supabase.auth.getUser();
      const payload={name:editing.name.trim(),category:editing.category||'Outros',description:editing.description||'',included:editing.included||'',default_price:Number(editing.default_price||0),active:editing.active!==false,owner_id:user.user.id};
      let result;
      if(editing.id) result=await supabase.from('refrig_service_catalog').update(payload).eq('id',editing.id).eq('owner_id',user.user.id).select().single();
      else result=await supabase.from('refrig_service_catalog').insert(payload).select().single();
      if(result.error) throw result.error;
      setEditing(null); await load(); refresh();
    }catch(e){setError(e.message||'Não foi possível salvar o serviço.');}
    finally{setSaving(false);}
  }

  async function toggleService(service){
    const {error:err}=await supabase.from('refrig_service_catalog').update({active:!service.active}).eq('id',service.id).eq('owner_id', (await supabase.auth.getUser()).data.user.id);
    if(err) setError(err.message); else load();
  }

  async function deleteService(service){
    if(!confirm(`Excluir o serviço “${service.name}” do catálogo?`)) return;
    const {error:err}=await supabase.from('refrig_service_catalog').delete().eq('id',service.id).eq('owner_id', (await supabase.auth.getUser()).data.user.id);
    if(err) setError(err.message); else load();
  }

  const filtered=services.filter(s=>(filter==='Todos'||s.category===filter) && `${s.name} ${s.category} ${s.description}`.toLowerCase().includes(search.toLowerCase()));
  const categories=['Todos',...serviceCategories.filter(c=>services.some(s=>s.category===c))];

  return <div className="content catalog-page">
    <PageHead title="Catálogo de serviços" sub="Cadastre uma vez e escolha os serviços prontos ao criar um orçamento." action={<button className="primary" onClick={startNew}><Plus size={18}/> Novo serviço</button>}/>
    {error&&<div className="form-error">{error}</div>}
    <div className="catalog-toolbar"><div className="catalog-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar serviço..."/></div><div className="tabs catalog-tabs">{categories.map(c=><button key={c} className={filter===c?'selected':''} onClick={()=>setFilter(c)}>{c}</button>)}</div></div>
    {loading?<Loading/>:<div className="catalog-grid">{filtered.map(service=><article className={`catalog-card ${!service.active?'inactive':''}`} key={service.id}><div className="catalog-card-top"><span className="catalog-category">{service.category}</span><button className="iconbtn" title="Editar" onClick={()=>startEdit(service)}><Pencil size={16}/></button></div><h2>{service.name}</h2><p>{service.description||'Sem descrição cadastrada.'}</p>{service.included&&<div className="catalog-included"><strong>Incluso</strong><span>{service.included}</span></div>}<div className="catalog-card-bottom"><strong>{Number(service.default_price||0)>0?money(service.default_price):'Preço a definir'}</strong><div><button className="secondary" onClick={()=>toggleService(service)}>{service.active?'Desativar':'Ativar'}</button><button className="iconbtn catalog-delete" title="Excluir" onClick={()=>deleteService(service)}><Trash2 size={16}/></button></div></div></article>)}{!filtered.length&&<Empty title="Nenhum serviço encontrado" text="Adicione um novo serviço ao catálogo."/>}</div>}
    {editing&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setEditing(null)}><div className="modal-card"><div className="panel-head"><div><h2>{editing.id?'Editar serviço':'Novo serviço'}</h2><p>Essas informações serão usadas no preenchimento e no PDF.</p></div><button className="iconbtn" onClick={()=>setEditing(null)}><X size={18}/></button></div><div className="form-grid"><label>Nome do serviço*<input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} placeholder="Ex.: Lavagem completa"/></label><label>Categoria*<select value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})}>{serviceCategories.map(c=><option key={c}>{c}</option>)}</select></label><label>Preço padrão<input type="number" step="0.01" min="0" value={editing.default_price} onChange={e=>setEditing({...editing,default_price:e.target.value})} placeholder="0,00"/></label></div><label>Descrição<input value={editing.description||''} onChange={e=>setEditing({...editing,description:e.target.value})} placeholder="Ex.: Lavagem completa de ar-condicionado"/></label><label>O que está incluso<textarea value={editing.included||''} onChange={e=>setEditing({...editing,included:e.target.value})} placeholder="Um item por linha"/></label><div className="modal-actions"><button className="secondary" onClick={()=>setEditing(null)}>Cancelar</button><button className="primary" onClick={saveService} disabled={saving}>{saving?<LoaderCircle className="spin" size={18}/>:<Save size={18}/>} {saving?'Salvando…':'Salvar serviço'}</button></div></div></div>}
  </div>;
}

function SettingsPage({refresh}) {
  const [company,setCompany]=useState({company_name:DEFAULT_COMPANY_NAME,document:'',phone:'',whatsapp:'',email:'',address:''});
  const [profileName,setProfileName]=useState('');
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [profileSaving,setProfileSaving]=useState(false); const [message,setMessage]=useState(''); const [profileMessage,setProfileMessage]=useState('');
  useEffect(()=>{supabase.auth.getUser().then(async({data})=>{const {data:row}=await supabase.from('refrig_company').select('*').eq('owner_id',data.user.id).maybeSingle(); if(row)setCompany({...row,company_name:displayCompanyName(row.company_name)}); else setCompany(c=>({...c,email:data.user.email||''})); setProfileName(data.user.user_metadata?.full_name || DEFAULT_COMPANY_NAME); setLoading(false);});},[]);
  async function saveProfile(){setProfileSaving(true);setProfileMessage('');const {error}=await supabase.auth.updateUser({data:{full_name:profileName.trim() || DEFAULT_COMPANY_NAME}});setProfileMessage(error?error.message:'Nome atualizado com sucesso.');setProfileSaving(false);if(!error)refresh();}
  async function save(){setSaving(true);setMessage('');const {data}=await supabase.auth.getUser();const {error}=await supabase.from('refrig_company').upsert({...company,company_name:company.company_name||DEFAULT_COMPANY_NAME,owner_id:data.user.id},{onConflict:'owner_id'});setMessage(error?error.message:'Dados salvos com sucesso.');setSaving(false);if(!error)refresh();}
  if(loading)return <div className="content"><Loading/> </div>;
  return <div className="content"><PageHead title="Configurações" sub="Gerencie os dados que serão usados nos próximos orçamentos e PDFs."/><div className="settings-grid"><section className="panel"><div className="panel-head"><div><h2>Perfil</h2><p>Dados do acesso atual.</p></div></div><label>Nome do responsável<input value={profileName} onChange={e=>setProfileName(e.target.value)} placeholder="Nome do responsável"/></label><label>E-mail<input value={company.email} readOnly/></label>{profileMessage&&<div className={profileMessage.includes('sucesso')?'form-success':'form-error'}>{profileMessage}</div>}<button className="primary" onClick={saveProfile} disabled={profileSaving}>{profileSaving?<LoaderCircle className="spin" size={18}/>:<Save size={18}/>} Salvar nome</button><button className="secondary" onClick={()=>supabase.auth.resetPasswordForEmail(company.email,{redirectTo:window.location.origin})}>Redefinir senha</button></section><section className="panel"><div className="panel-head"><div><h2>Dados da empresa</h2><p>Por enquanto, use Daniel Alves. Quando a marca estiver pronta, basta trocar aqui.</p></div></div>{[['company_name','Nome da empresa / marca'],['document','CNPJ / CPF (opcional)'],['phone','Telefone'],['whatsapp','WhatsApp'],['address','Endereço']].map(([k,l])=><label key={k}>{l}<input value={company[k]||''} onChange={e=>setCompany({...company,[k]:e.target.value})}/></label>)}{message&&<div className={message.includes('sucesso')?'form-success':'form-error'}>{message}</div>}<button className="primary" onClick={save} disabled={saving}>{saving?<LoaderCircle className="spin" size={18}/>:<Save size={18}/>} Salvar dados</button></section></div></div>;
}

createRoot(document.getElementById('root')).render(<App/>);
