import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, FileText, Wallet, ClipboardList, Settings, LogOut,
  Menu, X, Plus, Search, ChevronRight, Clock3, CheckCircle2,
  PlayCircle, PackageCheck, Eye, Pencil, Copy, Trash2, SlidersHorizontal,
  UserRound, Building2, Phone, MapPin, Mail, ArrowLeft, Download,
  MessageCircle, AlertCircle, LoaderCircle, Save, UserPlus, LockKeyhole,
  RefreshCw, BookOpen, Wrench, Check, XCircle
} from 'lucide-react';
import { supabase } from './lib/supabase';
import './styles.css';

const DEFAULT_COMPANY_NAME = 'Daniel Alves';
const DEFAULT_COMPANY_SUBTITLE = 'Refrigeração';

const nav = [
  ['home', 'Início', LayoutDashboard],
  ['quotes', 'Orçamentos', FileText],
  ['finance', 'Financeiro', Wallet],
  ['tickets', 'Chamados', ClipboardList],
  ['catalog', 'Catálogo de serviços', BookOpen],
  ['settings', 'Configurações', Settings],
];

const statusLabel = {
  aguardando_resposta: 'Aguardando resposta',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
};

const categories = [
  'Limpeza e Higienização',
  'Manutenção',
  'Gás Refrigerante',
  'Instalação',
  'Retirada / Mudança',
  'Reparos',
  'Visita Técnica'
];

const categoryLabels = {
  'Limpeza e Higienização': 'Limpar',
  'Manutenção': 'Fazer manutenção',
  'Gás Refrigerante': 'Colocar gás',
  'Instalação': 'Instalar',
  'Retirada / Mudança': 'Retirar / mudar',
  'Reparos': 'Consertar',
  'Visita Técnica': 'Avaliar problema'
};

const categoryLabel = (category) => categoryLabels[category] || category;

const money = (v = 0) =>
  Number(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const dateBR = (v) =>
  v ? new Date(`${v}T12:00:00`).toLocaleDateString('pt-BR') : '—';

const code = (prefix, n) =>
  `${prefix}-${String(n || 0).padStart(4, '0')}`;

const displayCompanyName = (value) => {
  const name = String(value || '').trim();
  if (!name || /frios\s*&\s*clima/i.test(name)) return DEFAULT_COMPANY_NAME;
  return name;
};

const whatsappNumber = (value = '') => {
  let number = String(value || '').replace(/\D/g, '');
  if (number.startsWith('00')) number = number.slice(2);
  if (number.startsWith('0')) number = number.slice(1);
  if (number.length === 10 || number.length === 11) number = `55${number}`;
  return number;
};

function Badge({ status }) {
  return (
    <span className={`badge ${status || ''}`}>
      <i />
      {statusLabel[status] || status || '—'}
    </span>
  );
}

function Loading({ label = 'Carregando...' }) {
  return (
    <div className="loading">
      <LoaderCircle className="spin" size={22} />
      {label}
    </div>
  );
}

function Empty({ title, text }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function PageHead({ title, sub, action }) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="stat">
      <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="info">
      <Icon size={17} />
      <div>
        <small>{label}</small>
        <span>{value || '—'}</span>
      </div>
    </div>
  );
}

/* ========================= AUTH ========================= */

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { data, error } =
          await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.session);
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        if (!data.session) {
          setMessage('Cadastro criado. Verifique seu e-mail para confirmar o acesso.');
        } else {
          onAuth(data.session);
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        setMessage('Enviamos um link de recuperação para seu e-mail.');
      }
    } catch (err) {
      setError(err.message || 'Não foi possível concluir a operação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brandmark">D</div>
          <div>
            <strong>{DEFAULT_COMPANY_NAME}</strong>
            <small>{DEFAULT_COMPANY_SUBTITLE}</small>
          </div>
        </div>

        <div className="auth-copy">
          <h1>
            {mode === 'login' ? 'Bem-vindo de volta' :
              mode === 'signup' ? 'Criar acesso' : 'Recuperar senha'}
          </h1>
          <p>
            {mode === 'login'
              ? 'Entre para acompanhar seus orçamentos e serviços.'
              : mode === 'signup'
                ? 'Crie o acesso do responsável pelo sistema.'
                : 'Informe seu e-mail para receber o link de recuperação.'}
          </p>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && (
            <label>Nome
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Nome do responsável" required />
            </label>
          )}

          <label>E-mail
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required />
          </label>

          {mode !== 'reset' && (
            <label>Senha
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                minLength={6} required />
            </label>
          )}

          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}

          <button className="primary full" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : <LockKeyhole size={18} />}
            {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('reset')}>Esqueci minha senha</button>
              <span>·</span>
              <button onClick={() => setMode('signup')}>Criar conta</button>
            </>
          ) : (
            <button onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
              Voltar para login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================= APP ========================= */

function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState('home');
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [companyName, setCompanyName] = useState(DEFAULT_COMPANY_NAME);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, next) => setSession(next)
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('refrig_company')
      .select('company_name')
      .eq('owner_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setCompanyName(displayCompanyName(data?.company_name));
      });
  }, [session, refresh]);

  const go = (next) => {
    setPage(next);
    setSelected(null);
    setEditingQuote(null);
    setMobile(false);
  };

  const openQuote = (quote) => {
    setSelected(quote);
    setEditingQuote(null);
    setMobile(false);
  };

  const editQuote = (quote) => {
    setEditingQuote(quote);
    setSelected(null);
    setPage('editQuote');
    setMobile(false);
  };

  const refreshData = () => setRefresh(v => v + 1);

  if (checking) return <Loading label="Conectando..." />;
  if (!session) return <Auth onAuth={setSession} />;

  return (
    <div className="app">
      <aside className={`sidebar ${mobile ? 'open' : ''}`}>
        <div className="brand">
          <div className="brandmark">D</div>
          <div>
            <strong>{companyName}</strong>
            <small>{DEFAULT_COMPANY_SUBTITLE}</small>
          </div>
          <button className="close" onClick={() => setMobile(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="profile">
          <div className="avatar">
            {(session.user.user_metadata?.full_name || 'DA')
              .split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <strong>{session.user.user_metadata?.full_name || 'Administrador'}</strong>
            <small>Administrador</small>
          </div>
        </div>

        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id && !selected ? 'active' : ''}
              onClick={() => go(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={() => supabase.auth.signOut()}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {mobile && <div className="overlay" onClick={() => setMobile(false)} />}

      <main className="main">
        <header>
          <button className="menu" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div className="header-search">
            <Search size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar orçamento, cliente..."
            />
          </div>
        </header>

        {selected ? (
          <QuoteDetail
            quote={selected}
            back={() => setSelected(null)}
            onChanged={refreshData}
            onEdit={editQuote}
          />
        ) : page === 'newQuote' || page === 'editQuote' ? (
          <NewQuote
            go={go}
            refresh={refreshData}
            quote={editingQuote}
          />
        ) : page === 'home' ? (
          <Home go={go} setSelected={openQuote} refresh={refresh} />
        ) : page === 'quotes' ? (
          <Quotes search={search} setSelected={openQuote}
            go={go} refresh={refresh} onEdit={editQuote} />
        ) : page === 'finance' ? (
          <Finance setSelected={openQuote} refresh={refresh} />
        ) : page === 'tickets' ? (
          <Tickets setSelected={openQuote} refresh={refresh} />
        ) : page === 'catalog' ? (
          <ServiceCatalog refresh={refreshData} />
        ) : (
          <SettingsPage refresh={refreshData} />
        )}
      </main>
    </div>
  );
}

/* ========================= DATA ========================= */

function useQuotes(refresh) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('refrig_quotes')
        .select(`
          *,
          refrig_clients(name, document, phone, whatsapp, email, address)
        `)
        .order('created_at', { ascending: false });

      if (alive) {
        setQuotes(data || []);
        setError(error?.message || '');
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [refresh]);

  return { quotes, loading, error };
}

/* ========================= HOME ========================= */

function Home({ go, setSelected, refresh }) {
  const { quotes, loading, error } = useQuotes(refresh);

  const counts = useMemo(() => ({
    aguardando_resposta: quotes.filter(q => q.status === 'aguardando_resposta').length,
    aprovado: quotes.filter(q => q.status === 'aprovado').length,
    em_andamento: quotes.filter(q => q.status === 'em_andamento').length,
    concluido: quotes.filter(q => q.status === 'concluido').length,
  }), [quotes]);

  const attention = quotes
    .filter(q => q.status === 'aguardando_resposta')
    .slice(0, 5);

  const approved = quotes.filter(q =>
    ['aprovado', 'em_andamento', 'concluido'].includes(q.status)
  );

  const total = approved.reduce(
    (sum, q) => sum + Number(q.total_final || 0), 0
  );

  return (
    <div className="content">
      <PageHead
        title={`Olá, ${DEFAULT_COMPANY_NAME} 👋`}
        sub="Acompanhe seus orçamentos e serviços de hoje."
        action={
          <button className="primary" onClick={() => go('newQuote')}>
            <Plus size={18} /> Novo orçamento
          </button>
        }
      />

      {error && <div className="form-error">{error}</div>}

      <div className="stats">
        <Stat icon={Clock3} label="Aguardando resposta"
          value={String(counts.aguardando_resposta).padStart(2, '0')} tone="orange" />
        <Stat icon={CheckCircle2} label="Aprovados"
          value={String(counts.aprovado).padStart(2, '0')} tone="green" />
        <Stat icon={PlayCircle} label="Em andamento"
          value={String(counts.em_andamento).padStart(2, '0')} tone="blue" />
        <Stat icon={PackageCheck} label="Concluídos"
          value={String(counts.concluido).padStart(2, '0')} tone="purple" />
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Orçamentos que precisam de atenção</h2>
            <p>Acompanhe os clientes que ainda não responderam.</p>
          </div>
          <button className="link" onClick={() => go('quotes')}>
            Ver todos <ChevronRight size={16} />
          </button>
        </div>

        {loading ? <Loading /> : attention.length ? (
          attention.map(q => (
            <div className="attention" key={q.id}>
              <div className="attention-icon"><AlertCircle size={20} /></div>
              <div className="grow">
                <strong>{code('ORC', q.quote_number)} · {q.refrig_clients?.name || 'Cliente'}</strong>
                <span>Criado em {dateBR(q.issue_date)}</span>
              </div>
              <strong>{money(q.total_final)}</strong>
              <Badge status={q.status} />
              <button className="iconbtn" onClick={() => setSelected(q)}>
                <Eye size={18} />
              </button>
            </div>
          ))
        ) : (
          <Empty
            title="Nenhum orçamento aguardando resposta"
            text="Quando você enviar uma proposta, ela aparecerá aqui."
          />
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Resumo financeiro</h2>
            <p>Valores dos orçamentos aprovados, em andamento e concluídos.</p>
          </div>
          <button className="link" onClick={() => go('finance')}>
            Ver financeiro <ChevronRight size={16} />
          </button>
        </div>

        <div className="finance-summary">
          <div><span>Total aprovado</span><strong>{money(total)}</strong></div>
          <div><span>Serviços aprovados</span><strong>{approved.length}</strong></div>
          <div>
            <span>Ticket médio</span>
            <strong>{money(approved.length ? total / approved.length : 0)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function PageHeadSpacer() { return null; }

function StatPlaceholder() { return null; }

function EmptyPlaceholder() { return null; }

/* ========================= ORÇAMENTOS ========================= */

function Quotes({ search, setSelected, go, refresh, onEdit }) {
  const { quotes, loading, error } = useQuotes(refresh);
  const [filter, setFilter] = useState('todos');

  const filtered = quotes.filter(q => {
    const matchesStatus = filter === 'todos' || q.status === filter;
    const text = `${q.quote_number} ${q.refrig_clients?.name || ''} ${q.status || ''}`.toLowerCase();
    return matchesStatus && text.includes(search.toLowerCase());
  });

  return (
    <div className="content">
      <PageHead
        title="Orçamentos"
        sub="Crie, acompanhe e organize suas propostas."
        action={
          <button className="primary" onClick={() => go('newQuote')}>
            <Plus size={18} /> Novo orçamento
          </button>
        }
      />

      {error && <div className="form-error">{error}</div>}

      <div className="toolbar">
        <div className="tabs">
          {[
            ['todos', 'Todos'],
            ['aguardando_resposta', 'Aguardando'],
            ['aprovado', 'Aprovados'],
            ['em_andamento', 'Em andamento'],
            ['concluido', 'Concluídos'],
            ['recusado', 'Recusados']
          ].map(([id, label]) => (
            <button key={id}
              className={filter === id ? 'selected' : ''}
              onClick={() => setFilter(id)}>
              {label}
              <b>{id === 'todos'
                ? quotes.length
                : quotes.filter(q => q.status === id).length}</b>
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : (
        <>
          <div className="tablepanel">
            <table>
              <thead>
                <tr>
                  <th>Orçamento</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q.id}>
                    <td><strong>{code('ORC', q.quote_number)}</strong></td>
                    <td>{q.refrig_clients?.name || 'Cliente'}</td>
                    <td>{dateBR(q.issue_date)}</td>
                    <td><strong>{money(q.total_final)}</strong></td>
                    <td><Badge status={q.status} /></td>
                    <td>
                      <div className="row-actions">
                        <button className="secondary small"
                          onClick={() => setSelected(q)}>
                          <Eye size={15} /> Ver
                        </button>
                        <button className="secondary small"
                          onClick={() => onEdit(q)}>
                          <Pencil size={15} /> Editar
                        </button>
                        <button className="danger small"
                          onClick={() => deleteQuote(q, refresh)}>
                          <Trash2 size={15} /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filtered.length && (
              <Empty
                title="Nenhum orçamento encontrado"
                text="Crie seu primeiro orçamento para começar."
              />
            )}
          </div>

          <div className="mobile-cards">
            {filtered.map(q => (
              <div className="quote-card" key={q.id}>
                <div>
                  <strong>{code('ORC', q.quote_number)}</strong>
                  <Badge status={q.status} />
                </div>
                <h3>{q.refrig_clients?.name || 'Cliente'}</h3>
                <p>{dateBR(q.issue_date)}</p>
                <strong>{money(q.total_final)}</strong>
                <div className="row-actions">
                  <button className="secondary small" onClick={() => setSelected(q)}>
                    <Eye size={15} /> Ver
                  </button>
                  <button className="secondary small" onClick={() => onEdit(q)}>
                    <Pencil size={15} /> Editar
                  </button>
                  <button className="danger small" onClick={() => deleteQuote(q, refresh)}>
                    <Trash2 size={15} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

async function deleteQuote(quote, refresh) {
  const ok = window.confirm(
    `Excluir o orçamento ${code('ORC', quote.quote_number)}?\n\nEssa ação não poderá ser desfeita.`
  );
  if (!ok) return;

  try {
    await supabase.from('refrig_service_calls').delete().eq('quote_id', quote.id);
    await supabase.from('refrig_quote_items').delete().eq('quote_id', quote.id);

    const { error } = await supabase
      .from('refrig_quotes')
      .delete()
      .eq('id', quote.id);

    if (error) throw error;
    refresh();
  } catch (err) {
    alert(err.message || 'Não foi possível excluir o orçamento.');
  }
}

/* ========================= NOVO / EDITAR ORÇAMENTO ========================= */

const blankEquipment = () => ({
  type: '', brand: '', model: '', capacity: '', observation: ''
});

const blankItem = () => ({
  equipmentIndex: 0,
  service_name: '',
  service_description: '',
  included: '',
  quantity: 1,
  original: '',
  discount: '',
  final: ''
});

function NewQuote({ go, refresh, quote }) {
  const [step, setStep] = useState(1);
  const [client, setClient] = useState({
    name: '', document: '', phone: '', whatsapp: '', email: '', address: '', notes: ''
  });
  const [equipment, setEquipment] = useState([blankEquipment()]);
  const [items, setItems] = useState([blankItem()]);
  const [catalog, setCatalog] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    const { data } = await supabase
      .from('refrig_service_catalog')
      .select('*')
      .eq('active', true)
      .order('category')
      .order('name');
    setCatalog(data || []);
  }

  useEffect(() => {
    if (!quote) return;

    (async () => {
      const clientData = quote.refrig_clients || {};
      setClient({
        name: clientData.name || '',
        document: clientData.document || '',
        phone: clientData.phone || '',
        whatsapp: clientData.whatsapp || '',
        email: clientData.email || '',
        address: clientData.address || '',
        notes: quote.notes || ''
      });

      const { data: eq } = await supabase
        .from('refrig_equipment')
        .select('*')
        .eq('client_id', quote.client_id)
        .order('created_at');

      const { data: rows } = await supabase
        .from('refrig_quote_items')
        .select('*, refrig_equipment(*)')
        .eq('quote_id', quote.id)
        .order('created_at');

      const equipmentRows = eq?.length ? eq : [];
      setEquipment(equipmentRows.length
        ? equipmentRows.map(e => ({
            type: e.equipment_type || '',
            brand: e.brand || '',
            model: e.model || '',
            capacity: e.capacity || '',
            observation: e.observation || '',
            id: e.id
          }))
        : [blankEquipment()]);

      setItems(rows?.length ? rows.map(r => ({
        equipmentIndex: Math.max(0,
          equipmentRows.findIndex(e => e.id === r.equipment_id)),
        service_name: r.service_name || '',
        service_description: r.service_description || '',
        included: r.included || '',
        quantity: r.quantity || 1,
        original: r.unit_original_value || '',
        discount: r.unit_discount || '',
        final: r.unit_final_value || ''
      })) : [blankItem()]);
    })();
  }, [quote]);

  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.final || 0),
    0
  );

  const originalTotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.original || 0),
    0
  );

  const discountTotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.discount || 0),
    0
  );

  function updateEquipment(i, key, value) {
    setEquipment(prev => prev.map((e, index) =>
      index === i ? { ...e, [key]: value } : e
    ));
  }

  function addEquipment() {
    const next = [...equipment, blankEquipment()];
    setEquipment(next);
    setItems(prev => [...prev, { ...blankItem(), equipmentIndex: next.length - 1 }]);
  }

  function updateItem(i, key, value) {
    setItems(prev => prev.map((item, index) =>
      index === i ? { ...item, [key]: value } : item
    ));
  }

  function addItem() {
    setItems(prev => [...prev, blankItem()]);
  }

  function chooseCatalog(index, catalogId) {
    const service = catalog.find(x => x.id === catalogId);
    if (!service) return;

    setItems(prev => prev.map((item, i) => i === index ? {
      ...item,
      service_name: service.name,
      service_description: service.description || '',
      included: service.included || '',
      original: service.default_price ?? '',
      discount: '',
      final: service.default_price ?? ''
    } : item));
  }

  async function save() {
    setError('');

    if (!client.name.trim()) {
      setError('Informe o nome do cliente.');
      setStep(1);
      return;
    }

    if (equipment.some(e => !String(e.type || '').trim())) {
      setError('Informe o tipo de todos os equipamentos.');
      setStep(2);
      return;
    }

    if (!items.length || items.some(i =>
      !String(i.service_name || '').trim() ||
      Number(i.final || 0) <= 0
    )) {
      setError('Informe o serviço e o valor final de cada item.');
      setStep(3);
      return;
    }

    setSaving(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const owner_id = auth.user.id;

      let clientId = quote?.client_id;

      if (clientId) {
        const { error } = await supabase
          .from('refrig_clients')
          .update({
            name: client.name,
            document: client.document,
            phone: client.phone,
            whatsapp: client.whatsapp,
            email: client.email,
            address: client.address
          })
          .eq('id', clientId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('refrig_clients')
          .insert({
            owner_id,
            name: client.name,
            document: client.document,
            phone: client.phone,
            whatsapp: client.whatsapp,
            email: client.email,
            address: client.address
          })
          .select()
          .single();
        if (error) throw error;
        clientId = data.id;
      }

      let equipmentRows = [];

      if (quote) {
        for (const e of equipment.filter(x => x.id)) {
          await supabase.from('refrig_equipment').update({
            equipment_type: e.type,
            brand: e.brand,
            model: e.model,
            capacity: e.capacity,
            observation: e.observation
          }).eq('id', e.id);
        }

        const newEquipment = equipment.filter(x => !x.id);
        if (newEquipment.length) {
          const { data, error } = await supabase
            .from('refrig_equipment')
            .insert(newEquipment.map(e => ({
              owner_id,
              client_id: clientId,
              equipment_type: e.type,
              brand: e.brand,
              model: e.model,
              capacity: e.capacity,
              observation: e.observation
            })))
            .select();
          if (error) throw error;
          equipmentRows = [...newEquipment.map((e, i) => ({ ...e, id: data[i].id }))];
        }

        const existing = equipment.filter(x => x.id);
        equipmentRows = [...existing, ...equipmentRows];

        await supabase.from('refrig_quote_items').delete().eq('quote_id', quote.id);

        const { error: qe } = await supabase
          .from('refrig_quotes')
          .update({
            notes: client.notes,
            total_original: originalTotal,
            total_discount: discountTotal,
            total_final: total
          })
          .eq('id', quote.id);
        if (qe) throw qe;

        await insertQuoteItems(quote.id, items, equipmentRows);
      } else {
        const { data, error } = await supabase
          .from('refrig_equipment')
          .insert(equipment.map(e => ({
            owner_id,
            client_id: clientId,
            equipment_type: e.type,
            brand: e.brand,
            model: e.model,
            capacity: e.capacity,
            observation: e.observation
          })))
          .select()
          .order('created_at');

        if (error) throw error;

        equipmentRows = data;

        const { data: q, error: qe } = await supabase
          .from('refrig_quotes')
          .insert({
            owner_id,
            client_id: clientId,
            notes: client.notes,
            total_original: originalTotal,
            total_discount: discountTotal,
            total_final: total
          })
          .select()
          .single();

        if (qe) throw qe;

        await insertQuoteItems(q.id, items, equipmentRows);
      }

      refresh();
      go('quotes');
    } catch (err) {
      setError(err.message || 'Não foi possível salvar o orçamento.');
    } finally {
      setSaving(false);
    }
  }

  async function insertQuoteItems(quoteId, rows, equipmentRows) {
    const payload = rows.map(item => ({
      quote_id: quoteId,
      equipment_id: equipmentRows[item.equipmentIndex]?.id,
      service_name: item.service_name,
      service_description: item.service_description,
      included: item.included,
      quantity: Number(item.quantity || 1),
      unit_original_value: Number(item.original || 0),
      unit_discount: Number(item.discount || 0),
      unit_final_value: Number(item.final || 0)
    }));

    let result = await supabase
      .from('refrig_quote_items')
      .insert(payload);

    if (result.error && /included|column/i.test(result.error.message || '')) {
      const fallback = payload.map(({ included, ...rest }) => rest);
      result = await supabase.from('refrig_quote_items').insert(fallback);
    }

    if (result.error) throw result.error;
  }

  return (
    <div className="content">
      <button className="back" onClick={() => go('quotes')}>
        <ArrowLeft size={18} /> Voltar
      </button>

      <PageHead
        title={quote ? 'Editar orçamento' : 'Criar orçamento'}
        sub="Monte uma proposta com serviços e valores por equipamento."
        action={
          <button className="primary" onClick={save} disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}
            {quote ? 'Salvar alterações' : 'Salvar orçamento'}
          </button>
        }
      />

      {error && <div className="form-error">{error}</div>}

      <div className="steps">
        {[
          [1, 'Cliente'],
          [2, 'Equipamentos'],
          [3, 'Serviços'],
          [4, 'Revisão']
        ].map(([n, label]) => (
          <button key={n}
            className={step === n ? 'active' : step > n ? 'done' : ''}
            onClick={() => setStep(n)}>
            <span>{step > n ? <Check size={15} /> : n}</span>
            {label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <section className="panel form-section">
          <div className="panel-head">
            <div>
              <h2>Cliente</h2>
              <p>Quem receberá o orçamento.</p>
            </div>
          </div>

          <div className="form-grid">
            {[
              ['name', 'Nome*', 'text'],
              ['document', 'CPF / CNPJ', 'text'],
              ['phone', 'Telefone', 'text'],
              ['whatsapp', 'WhatsApp', 'text'],
              ['email', 'E-mail', 'email'],
              ['address', 'Endereço', 'text']
            ].map(([key, label, type]) => (
              <label key={key}>{label}
                <input type={type} value={client[key] || ''}
                  onChange={e => setClient({ ...client, [key]: e.target.value })} />
              </label>
            ))}
          </div>

          <label>Observações
            <textarea value={client.notes}
              onChange={e => setClient({ ...client, notes: e.target.value })}
              placeholder="Observações gerais do orçamento..." />
          </label>

          <div className="form-footer">
            <button className="primary" onClick={() => setStep(2)}>
              Próximo <ChevronRight size={17} />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="panel form-section">
          <div className="panel-head">
            <div>
              <h2>Equipamentos</h2>
              <p>Cadastre cada equipamento que receberá serviço.</p>
            </div>
            <button className="secondary" onClick={addEquipment}>
              <Plus size={16} /> Adicionar equipamento
            </button>
          </div>

          {equipment.map((e, i) => (
            <div className="equipment-form" key={i}>
              <div className="mini-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="form-grid equipment-fields">
                <label>Tipo*
                  <input value={e.type}
                    onChange={ev => updateEquipment(i, 'type', ev.target.value)}
                    placeholder="Ex.: Piso-Teto" />
                </label>
                <label>Marca
                  <input value={e.brand}
                    onChange={ev => updateEquipment(i, 'brand', ev.target.value)} />
                </label>
                <label>Modelo
                  <input value={e.model}
                    onChange={ev => updateEquipment(i, 'model', ev.target.value)} />
                </label>
                <label>Capacidade
                  <input value={e.capacity}
                    onChange={ev => updateEquipment(i, 'capacity', ev.target.value)}
                    placeholder="60.000 BTU" />
                </label>
                <label className="full-field">Observação
                  <input value={e.observation || ''}
                    onChange={ev => updateEquipment(i, 'observation', ev.target.value)} />
                </label>
              </div>
            </div>
          ))}

          <div className="form-footer">
            <button className="secondary" onClick={() => setStep(1)}>
              <ArrowLeft size={17} /> Voltar
            </button>
            <button className="primary" onClick={() => setStep(3)}>
              Próximo <ChevronRight size={17} />
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="panel form-section">
          <div className="panel-head">
            <div>
              <h2>Serviços</h2>
              <p>O mesmo equipamento pode ter vários serviços.</p>
            </div>
            <button className="secondary" onClick={addItem}>
              <Plus size={16} /> Adicionar serviço
            </button>
          </div>

          {items.map((item, i) => (
            <div className="service-editor" key={i}>
              <div className="service-editor-head">
                <strong>Serviço {String(i + 1).padStart(2, '0')}</strong>
                <button className="iconbtn"
                  onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                  disabled={items.length === 1}>
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="form-grid">
                <label className="full-field">Equipamento
                  <select value={item.equipmentIndex}
                    onChange={e => updateItem(i, 'equipmentIndex', Number(e.target.value))}>
                    {equipment.map((e, idx) => (
                      <option key={idx} value={idx}>
                        {idx + 1}. {e.type || 'Equipamento'} {e.capacity ? `— ${e.capacity}` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="full-field">Escolher do catálogo
                  <select defaultValue=""
                    onChange={e => chooseCatalog(i, e.target.value)}>
                    <option value="">Selecione um serviço pronto...</option>
                    {categories.map(category => (
                      <optgroup key={category} label={categoryLabel(category)}>
                        {catalog.filter(s => s.category === category).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>

                <label>Serviço*
                  <input value={item.service_name}
                    onChange={e => updateItem(i, 'service_name', e.target.value)}
                    placeholder="Lavagem completa" />
                </label>

                <label>Quantidade
                  <input type="number" min="1" value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)} />
                </label>

                <label>Valor original
                  <input type="number" step="0.01" value={item.original}
                    onChange={e => updateItem(i, 'original', e.target.value)} />
                </label>

                <label>Desconto por unidade
                  <input type="number" step="0.01" value={item.discount}
                    onChange={e => updateItem(i, 'discount', e.target.value)} />
                </label>

                <label>Valor final*
                  <input type="number" step="0.01" value={item.final}
                    onChange={e => updateItem(i, 'final', e.target.value)} />
                </label>

                <label className="full-field">Descrição
                  <textarea value={item.service_description || ''}
                    onChange={e => updateItem(i, 'service_description', e.target.value)} />
                </label>

                <label className="full-field">O que está incluso
                  <textarea value={item.included || ''}
                    onChange={e => updateItem(i, 'included', e.target.value)}
                    placeholder={"Ex.:\nInspeção das conexões\nTeste de vazamento\nIdentificação do ponto de fuga"} />
                </label>
              </div>

              <div className="item-total">
                Total do item
                <strong>{money(Number(item.quantity || 0) * Number(item.final || 0))}</strong>
              </div>
            </div>
          ))}

          <div className="form-footer">
            <button className="secondary" onClick={() => setStep(2)}>
              <ArrowLeft size={17} /> Voltar
            </button>
            <button className="primary" onClick={() => setStep(4)}>
              Revisar <ChevronRight size={17} />
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <>
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Revisão</h2>
                <p>Confira os dados antes de salvar.</p>
              </div>
            </div>

            <div className="review-grid">
              <div>
                <small>CLIENTE</small>
                <strong>{client.name || '—'}</strong>
                <span>{client.document || 'CPF/CNPJ não informado'}</span>
                <span>{client.address || 'Endereço não informado'}</span>
              </div>
              <div>
                <small>CONTATO</small>
                <span>{client.phone || '—'}</span>
                <span>{client.whatsapp || '—'}</span>
                <span>{client.email || '—'}</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Serviços</h2>
                <p>Serviço, equipamento, inclusos e valores.</p>
              </div>
            </div>

            {items.map((item, i) => (
              <div className="review-service" key={i}>
                <div>
                  <strong>{item.service_name || 'Serviço'}</strong>
                  <span>
                    {equipment[item.equipmentIndex]?.type || 'Equipamento'}
                    {equipment[item.equipmentIndex]?.capacity
                      ? ` — ${equipment[item.equipmentIndex].capacity}` : ''}
                  </span>
                </div>

                {item.included && (
                  <div className="included-list">
                    <small>INCLUSO</small>
                    {String(item.included).split(/\r?\n|;/)
                      .map(x => x.trim()).filter(Boolean)
                      .map((x, idx) => (
                        <span key={idx}><Check size={14} /> {x}</span>
                      ))}
                  </div>
                )}

                <strong>{money(Number(item.quantity || 0) * Number(item.final || 0))}</strong>
              </div>
            ))}
          </section>

          <section className="panel total-box">
            <span>Valor total do orçamento</span>
            <strong>{money(total)}</strong>
          </section>

          <div className="form-footer">
            <button className="secondary" onClick={() => setStep(3)}>
              <ArrowLeft size={17} /> Voltar
            </button>
            <button className="primary" onClick={save} disabled={saving}>
              {saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}
              {quote ? 'Salvar alterações' : 'Salvar orçamento'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ========================= DETALHE / PDF ========================= */

function QuoteDetail({ quote, back, onChanged, onEdit }) {
  const [status, setStatus] = useState(quote.status);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('refrig_quote_items')
      .select('*, refrig_equipment(equipment_type,brand,model,capacity)')
      .eq('quote_id', quote.id)
      .order('created_at')
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, [quote.id]);

  const client = quote.refrig_clients || {};

  async function changeStatus(next) {
    setSaving(true);

    const { error } = await supabase
      .from('refrig_quotes')
      .update({ status: next })
      .eq('id', quote.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    if (next === 'aprovado') {
      const { data: user } = await supabase.auth.getUser();

      const { data: existing } = await supabase
        .from('refrig_service_calls')
        .select('id')
        .eq('quote_id', quote.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('refrig_service_calls').insert({
          owner_id: user.user.id,
          quote_id: quote.id,
          status: 'aprovado'
        });
      }
    }

    setStatus(next);
    onChanged();
    setSaving(false);
  }

  async function copyQuote() {
    try {
      const { data: user } = await supabase.auth.getUser();

      const { data: newQuote, error } = await supabase
        .from('refrig_quotes')
        .insert({
          owner_id: user.user.id,
          client_id: quote.client_id,
          notes: quote.notes || '',
          total_original: quote.total_original || 0,
          total_discount: quote.total_discount || 0,
          total_final: quote.total_final || 0
        })
        .select()
        .single();

      if (error) throw error;

      const payload = items.map(i => ({
        quote_id: newQuote.id,
        equipment_id: i.equipment_id,
        service_name: i.service_name,
        service_description: i.service_description,
        included: i.included,
        quantity: i.quantity,
        unit_original_value: i.unit_original_value,
        unit_discount: i.unit_discount,
        unit_final_value: i.unit_final_value
      }));

      let result = await supabase.from('refrig_quote_items').insert(payload);
      if (result.error && /included|column/i.test(result.error.message || '')) {
        result = await supabase.from('refrig_quote_items')
          .insert(payload.map(({ included, ...rest }) => rest));
      }

      if (result.error) throw result.error;

      alert(`Cópia criada: ${code('ORC', newQuote.quote_number)}`);
      onChanged();
      back();
    } catch (err) {
      alert(err.message || 'Não foi possível duplicar o orçamento.');
    }
  }

  async function openWhatsApp() {
    const number = whatsappNumber(client.whatsapp || client.phone);

    if (!number) {
      alert('O cliente não possui telefone/WhatsApp cadastrado.');
      return;
    }

    const message =
      `Olá, ${client.name || ''}! Tudo bem?\n\n` +
      `Segue o orçamento ${code('ORC', quote.quote_number)}, ` +
      `referente aos serviços solicitados, no valor total de ${money(quote.total_final)}.\n\n` +
      `O orçamento é válido por 7 dias. Em caso de dúvidas ou para aprovação, fico à disposição.\n\n` +
      `${DEFAULT_COMPANY_NAME} | ${DEFAULT_COMPANY_SUBTITLE}`;

    try {
      // Gera o mesmo PDF do botão "Gerar PDF" e baixa para o dispositivo.
      const result = await generatePDF(quote, items, { download: false });

      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.fileName;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      // Abre DIRETAMENTE a conversa do cliente com a mensagem pronta.
      // Isso funciona tanto no celular quanto no desktop/WhatsApp Web.
      const whatsappUrl =
        `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

      window.location.href = whatsappUrl;
    } catch (err) {
      console.error(err);
      alert(`Não foi possível preparar o PDF para o WhatsApp: ${err?.message || err}`);
    }
  }

  return (
    <div className="content">
      <button className="back" onClick={back}>
        <ArrowLeft size={18} /> Voltar para orçamentos
      </button>

      <PageHead
        title={code('ORC', quote.quote_number)}
        sub="Detalhes do orçamento"
        action={
          <div className="actions">
            <button className="secondary" onClick={() => onEdit(quote)}>
              <Pencil size={17} /> Editar
            </button>
            <button className="secondary" onClick={() => generatePDF(quote, items)}>
              <Download size={17} /> Gerar PDF
            </button>
            <button className="secondary" onClick={copyQuote}>
              <Copy size={17} /> Duplicar
            </button>
            <button className="primary" onClick={openWhatsApp}>
              <MessageCircle size={17} /> WhatsApp
            </button>
            <button className="danger" onClick={() => deleteQuote(quote, () => {
              onChanged();
              back();
            })}>
              <Trash2 size={17} /> Excluir
            </button>
          </div>
        }
      />

      <div className="detail-grid">
        <section className="panel">
          <div className="panel-head">
            <div><h2>Cliente</h2><p>Dados do solicitante.</p></div>
            <Badge status={status} />
          </div>

          <div className="info-grid">
            <Info icon={UserRound} label="Nome" value={client.name} />
            <Info icon={FileText} label="CPF / CNPJ" value={client.document} />
            <Info icon={Phone} label="Telefone" value={client.phone} />
            <Info icon={MessageCircle} label="WhatsApp" value={client.whatsapp} />
            <Info icon={MapPin} label="Endereço" value={client.address} />
            <Info icon={Mail} label="E-mail" value={client.email} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div><h2>Serviços</h2><p>Composição do orçamento.</p></div>
          </div>

          {loading ? <Loading /> : items.map(item => {
            const equipment = item.refrig_equipment || {};
            const lineTotal =
              Number(item.quantity || 0) * Number(item.unit_final_value || 0);

            return (
              <div className="service-detail" key={item.id}>
                <div className="service-line">
                  <div>
                    <strong>{item.service_name}</strong>
                    <span>
                      {item.quantity} × {equipment.equipment_type || 'Equipamento'}
                      {equipment.capacity ? ` — ${equipment.capacity}` : ''}
                    </span>
                  </div>
                  <strong>{money(lineTotal)}</strong>
                </div>

                {item.service_description && (
                  <p className="service-description">{item.service_description}</p>
                )}

                {item.included && (
                  <div className="included-list">
                    <small>O QUE ESTÁ INCLUSO</small>
                    {String(item.included).split(/\r?\n|;/)
                      .map(x => x.trim()).filter(Boolean)
                      .map((x, idx) => (
                        <span key={idx}><Check size={14} /> {x}</span>
                      ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="total">
            <span>Total</span>
            <strong>{money(quote.total_final)}</strong>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div><h2>Status</h2><p>Atualize o andamento do orçamento.</p></div>
        </div>

        <div className="status-actions">
          {[
            ['aguardando_resposta', 'Aguardando resposta'],
            ['aprovado', 'Aprovar'],
            ['recusado', 'Recusar'],
            ['em_andamento', 'Em andamento'],
            ['concluido', 'Concluir']
          ].map(([id, label]) => (
            <button key={id}
              className={status === id ? 'selected' : ''}
              disabled={saving}
              onClick={() => changeStatus(id)}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {quote.notes && (
        <section className="panel">
          <h2>Observações</h2>
          <p className="note">{quote.notes}</p>
        </section>
      )}
    </div>
  );
}

const pdfText = (value) => String(value ?? '—').replace(/\s+/g, ' ').trim() || '—';
const pdfMoney = (value) => money(Number(value || 0));

async function generatePDF(quote, items, { download = true } = {}) {
  try {
  const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
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
    const companyName = DEFAULT_COMPANY_NAME;
    const client = quote.refrig_clients || {};
    const fileClientName = String(client.name || 'Cliente').replace(/[^a-z0-9áéíóúãõçàâêôü _-]/gi, '').trim() || 'Cliente';
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
  const halfX = margin + contentW / 2 + 3;
  const clientDocument = client?.document || client?.cpf_cnpj || client?.cpf || client?.cnpj || '';

  doc.setTextColor(...blue);
  doc.setFont('helvetica','bold');
  doc.setFontSize(6.5);
  doc.text('CLIENTE', margin, 31);
  doc.text('CONTATO', halfX, 31);

  // Divisor entre os dois blocos
  doc.setDrawColor(219,234,254);
  doc.setLineWidth(0.7);
  doc.line(margin + contentW/2, 31, margin + contentW/2, 47);
  doc.setLineWidth(0.2);

  // Dados do cliente: nome, CPF/CNPJ e endereço
  doc.setTextColor(...dark);
  doc.setFont('helvetica','bold');
  doc.setFontSize(7.5);
  doc.text(pdfText(client.name), margin, 35);

  doc.setFont('helvetica','normal');
  doc.setTextColor(...muted);
  doc.setFontSize(6.5);
  let clientY = 39;
  if (clientDocument) {
    doc.text(`CPF/CNPJ: ${pdfText(clientDocument)}`, margin, clientY, { maxWidth: contentW/2 - 8 });
    clientY += 4;
  }
  if (client.address) {
    doc.text(pdfText(client.address), margin, clientY, { maxWidth: contentW/2 - 8 });
  }

  // Dados de contato: telefone, WhatsApp e e-mail do cliente
  const contactLines = [
    client?.phone ? `Telefone: ${client.phone}` : '',
    client?.whatsapp ? `WhatsApp: ${client.whatsapp}` : '',
    client?.email ? `E-mail: ${client.email}` : ''
  ].filter(Boolean);

  let cy = 35;
  contactLines.slice(0, 3).forEach(value => {
    doc.text(pdfText(value), halfX, cy, { maxWidth: contentW/2 - 8 });
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
    autoTable(doc, {
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

    autoTable(doc, {
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
  } catch (err) {
    console.error(err);
    alert(`Não foi possível gerar o PDF: ${err?.message || err}`);
  }
}
/* ========================= FINANCEIRO ========================= */

function Finance({ setSelected, refresh }) {
  const { quotes, loading } = useQuotes(refresh);
  const [month, setMonth] = useState('all');

  const approved = quotes.filter(q =>
    ['aprovado', 'em_andamento', 'concluido'].includes(q.status)
  );

  const filtered = approved.filter(q => {
    if (month === 'all') return true;
    return String(q.issue_date || '').slice(0, 7) === month;
  });

  const total = filtered.reduce(
    (sum, q) => sum + Number(q.total_final || 0), 0
  );

  const months = [...new Set(
    approved.map(q => String(q.issue_date || '').slice(0, 7)).filter(Boolean)
  )];

  return (
    <div className="content">
      <PageHead
        title="Financeiro"
        sub="Somente orçamentos aprovados entram automaticamente no financeiro."
      />

      <div className="finance-filter">
        <label>Período
          <select value={month} onChange={e => setMonth(e.target.value)}>
            <option value="all">Todos os períodos</option>
            {months.map(m => (
              <option key={m} value={m}>
                {new Date(`${m}-15T12:00:00`).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="finance-cards">
        <div className="bigmetric">
          <span>Total aprovado</span>
          <strong>{money(total)}</strong>
          <small>{filtered.length} orçamento(s) considerado(s).</small>
        </div>
        <div className="bigmetric">
          <span>Ticket médio</span>
          <strong>{money(filtered.length ? total / filtered.length : 0)}</strong>
          <small>Baseado nos orçamentos aprovados.</small>
        </div>
      </div>

      <div className="tablepanel">
        <div className="table-title">
          <div>
            <h2>Movimentações</h2>
            <p>Clique em um item para consultar o orçamento.</p>
          </div>
        </div>

        {loading ? <Loading /> : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Orçamento</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q.id} onClick={() => setSelected(q)}>
                    <td><strong>{code('ORC', q.quote_number)}</strong></td>
                    <td>{q.refrig_clients?.name || 'Cliente'}</td>
                    <td>{dateBR(q.issue_date)}</td>
                    <td><Badge status={q.status} /></td>
                    <td><strong>{money(q.total_final)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-cards">
              {filtered.map(q => (
                <div className="quote-card" key={q.id}
                  onClick={() => setSelected(q)}>
                  <div>
                    <strong>{code('ORC', q.quote_number)}</strong>
                    <Badge status={q.status} />
                  </div>
                  <h3>{q.refrig_clients?.name || 'Cliente'}</h3>
                  <p>{dateBR(q.issue_date)}</p>
                  <strong>{money(q.total_final)}</strong>
                </div>
              ))}
            </div>

            {!filtered.length && (
              <Empty title="Nenhuma movimentação encontrada"
                text="Quando um orçamento for aprovado, ele aparecerá aqui." />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ========================= CHAMADOS ========================= */

function Tickets({ setSelected, refresh }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    setLoading(true);

    supabase
      .from('refrig_service_calls')
      .select('*, refrig_quotes(*, refrig_clients(name))')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTickets(data || []);
        setLoading(false);
      });
  }, [refresh]);

  const filtered = tickets.filter(t =>
    filter === 'todos' || t.status === filter
  );

  return (
    <div className="content">
      <PageHead
        title="Chamados"
        sub="Serviços aprovados e em execução."
      />

      <div className="toolbar">
        <div className="tabs">
          {[
            ['todos', 'Todos'],
            ['aprovado', 'Aprovados'],
            ['em_andamento', 'Em andamento'],
            ['concluido', 'Concluídos'],
            ['recusado', 'Recusados']
          ].map(([id, label]) => (
            <button key={id}
              className={filter === id ? 'selected' : ''}
              onClick={() => setFilter(id)}>
              {label}
              <b>{id === 'todos'
                ? tickets.length
                : tickets.filter(t => t.status === id).length}</b>
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="ticket-list">
          {filtered.map(t => (
            <div className="ticket" key={t.id}
              onClick={() => t.refrig_quotes && setSelected(t.refrig_quotes)}>
              <div className="ticket-num">
                {code('CH', t.call_number)}
              </div>
              <div className="grow">
                <strong>{t.refrig_quotes?.refrig_clients?.name || 'Cliente'}</strong>
                <span>{code('ORC', t.refrig_quotes?.quote_number)}</span>
              </div>
              <strong>{money(t.refrig_quotes?.total_final)}</strong>
              <Badge status={t.status} />
              <ChevronRight size={18} />
            </div>
          ))}

          {!filtered.length && (
            <Empty
              title="Nenhum chamado encontrado"
              text="Um chamado será criado automaticamente quando um orçamento for aprovado."
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ========================= CATÁLOGO ========================= */

function ServiceCatalog({ refresh }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from('refrig_service_catalog')
      .select('*')
      .order('category')
      .order('name');

    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [refresh]);

  const filtered = services.filter(service => {
    const categoryMatch =
      filter === 'Todos' || service.category === filter;

    const searchMatch =
      `${service.name} ${service.description || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return categoryMatch && searchMatch;
  });

  async function toggleActive(service) {
    await supabase
      .from('refrig_service_catalog')
      .update({ active: !service.active })
      .eq('id', service.id);

    load();
  }

  async function remove(service) {
    if (!window.confirm(`Excluir "${service.name}" do catálogo?`)) return;

    const { error } = await supabase
      .from('refrig_service_catalog')
      .delete()
      .eq('id', service.id);

    if (error) {
      alert(error.message);
      return;
    }

    load();
  }

  return (
    <div className="content">
      <PageHead
        title="Catálogo de serviços"
        sub="Cadastre uma vez e reutilize os serviços nos próximos orçamentos."
        action={
          <button className="primary"
            onClick={() => { setEditing(null); setModal(true); }}>
            <Plus size={18} /> Novo serviço
          </button>
        }
      />

      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={17} />
          <input placeholder="Buscar serviço..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="catalog-tabs">
        {['Todos', ...categories].map(category => (
          <button key={category}
            className={filter === category ? 'selected' : ''}
            onClick={() => setFilter(category)}>
            {category === 'Todos' ? 'Todos' : categoryLabel(category)}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <div className="catalog-grid">
          {filtered.map(service => (
            <div className={`catalog-card ${!service.active ? 'inactive' : ''}`}
              key={service.id}>

              <div className="catalog-card-top">
                <div>
                  <span className="catalog-category">{categoryLabel(service.category)}</span>
                  <h3>{service.name}</h3>
                </div>
                <strong>{money(service.default_price)}</strong>
              </div>

              {service.description && (
                <p>{service.description}</p>
              )}

              {service.included && (
                <div className="catalog-included">
                  <small>O QUE ESTÁ INCLUSO</small>
                  {String(service.included).split(/\r?\n|;/)
                    .map(x => x.trim()).filter(Boolean)
                    .slice(0, 5).map((x, i) => (
                      <span key={i}><Check size={13} /> {x}</span>
                    ))}
                </div>
              )}

              <div className="catalog-actions">
                <button className="secondary small"
                  onClick={() => { setEditing(service); setModal(true); }}>
                  <Pencil size={15} /> Editar
                </button>
                <button className="secondary small"
                  onClick={() => toggleActive(service)}>
                  {service.active ? 'Desativar' : 'Ativar'}
                </button>
                <button className="danger small"
                  onClick={() => remove(service)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <Empty
              title="Nenhum serviço encontrado"
              text="Cadastre seu primeiro serviço no catálogo."
            />
          )}
        </div>
      )}

      {modal && (
        <ServiceModal
          service={editing}
          onClose={() => setModal(false)}
          onSaved={() => { setModal(false); load(); }}
        />
      )}
    </div>
  );
}

function ServiceModal({ service, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: service?.name || '',
    category: service?.category || categories[0],
    description: service?.description || '',
    included: service?.included || '',
    default_price: service?.default_price ?? '',
    active: service?.active ?? true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!form.name.trim()) {
      setError('Informe o nome do serviço.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { data: user } = await supabase.auth.getUser();

      const payload = {
        owner_id: user.user.id,
        name: form.name,
        category: form.category,
        description: form.description,
        included: form.included,
        default_price: Number(form.default_price || 0),
        active: form.active,
        updated_at: new Date().toISOString()
      };

      const result = service
        ? await supabase.from('refrig_service_catalog')
            .update(payload).eq('id', service.id)
        : await supabase.from('refrig_service_catalog')
            .insert(payload);

      if (result.error) throw result.error;
      onSaved();
    } catch (err) {
      setError(err.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{service ? 'Editar serviço' : 'Novo serviço'}</h2>
            <p>Esses dados poderão ser usados automaticamente nos orçamentos.</p>
          </div>
          <button className="iconbtn" onClick={onClose}><X /></button>
        </div>

        <div className="form-grid">
          <label>Nome do serviço*
            <input value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex.: Lavagem completa" />
          </label>

          <label>Categoria*
            <select value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
          </label>

          <label className="full-field">Descrição
            <textarea value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Explique brevemente o serviço." />
          </label>

          <label className="full-field">O que está incluso
            <textarea value={form.included}
              onChange={e => setForm({ ...form, included: e.target.value })}
              placeholder={"Um item por linha.\nEx.: Inspeção das conexões\nTeste de vazamento"} />
          </label>

          <label>Preço padrão
            <input type="number" step="0.01" value={form.default_price}
              onChange={e => setForm({ ...form, default_price: e.target.value })} />
          </label>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>Cancelar</button>
          <button className="primary" onClick={save} disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}
            Salvar serviço
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================= CONFIGURAÇÕES ========================= */

function SettingsPage({ refresh }) {
  const [company, setCompany] = useState({
    company_name: DEFAULT_COMPANY_NAME,
    document: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: ''
  });

  const [profileName, setProfileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();

      const { data: row } = await supabase
        .from('refrig_company')
        .select('*')
        .eq('owner_id', auth.user.id)
        .maybeSingle();

      if (row) {
        setCompany({
          company_name: row.company_name || DEFAULT_COMPANY_NAME,
          document: row.document || '',
          phone: row.phone || '',
          whatsapp: row.whatsapp || '',
          email: row.email || auth.user.email || '',
          address: row.address || ''
        });
      } else {
        setCompany(c => ({ ...c, email: auth.user.email || '' }));
      }

      setProfileName(auth.user.user_metadata?.full_name || '');
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMessage('');

    try {
      const { data: auth } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('refrig_company')
        .upsert({
          ...company,
          owner_id: auth.user.id,
          company_name: company.company_name || DEFAULT_COMPANY_NAME
        }, { onConflict: 'owner_id' });

      if (error) throw error;

      await supabase.auth.updateUser({
        data: { full_name: profileName }
      });

      setMessage('Dados salvos com sucesso.');
      refresh();
    } catch (err) {
      setMessage(err.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="content"><Loading /></div>;

  return (
    <div className="content">
      <PageHead
        title="Configurações"
        sub="Gerencie seus dados e as informações usadas nos PDFs."
      />

      <div className="settings-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Perfil</h2>
              <p>Dados do acesso atual.</p>
            </div>
          </div>

          <label>Nome do responsável
            <input value={profileName}
              onChange={e => setProfileName(e.target.value)}
              placeholder="Daniel Alves" />
          </label>

          <label>E-mail
            <input value={company.email} readOnly />
          </label>

          <button className="secondary"
            onClick={() => supabase.auth.resetPasswordForEmail(
              company.email,
              { redirectTo: window.location.origin }
            )}>
            <RefreshCw size={17} /> Redefinir senha
          </button>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Dados da empresa</h2>
              <p>Serão utilizados automaticamente nos documentos.</p>
            </div>
          </div>

          <div className="settings-help">
            Por enquanto, use <strong>Daniel Alves</strong>.
            Quando a marca estiver pronta, basta trocar aqui.
          </div>

          {[
            ['company_name', 'Nome da empresa'],
            ['document', 'CNPJ / CPF'],
            ['phone', 'Telefone'],
            ['whatsapp', 'WhatsApp'],
            ['address', 'Endereço']
          ].map(([key, label]) => (
            <label key={key}>{label}
              <input value={company[key] || ''}
                onChange={e => setCompany({ ...company, [key]: e.target.value })} />
            </label>
          ))}

          {message && (
            <div className={message.includes('sucesso')
              ? 'form-success' : 'form-error'}>
              {message}
            </div>
          )}

          <button className="primary" onClick={save} disabled={saving}>
            {saving ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}
            Salvar dados
          </button>
        </section>
      </div>
    </div>
  );
}

function createUnusedComponents() {
  return null;
}

createRoot(document.getElementById('root')).render(<App />);
