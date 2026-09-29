import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, FileText, Wallet, ClipboardList, Settings, LogOut, Menu, X, Plus, Search,
  ChevronRight, Clock3, CheckCircle2, PlayCircle, PackageCheck, MoreHorizontal, Eye, Pencil,
  Trash2, SlidersHorizontal, UserRound, Phone, MapPin, Mail, ArrowLeft,
  Download, MessageCircle, AlertCircle, LoaderCircle, Save, LockKeyhole
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

const money = (v = 0) =>
  Number(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const dateBR = (v) =>
  v
    ? new Date(`${v}T12:00:00`).toLocaleDateString('pt-BR')
    : '—';

function Badge({ status }) {
  const label = statusLabel[status] || status;

  return (
    <span className={`badge ${status}`}>
      <i /> {label}
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

/* =========================================================
   ESTILO EXCLUSIVO DO DOCUMENTO PDF
   ========================================================= */

const printStyles = `
@media screen {
  .print-document {
    display: none !important;
  }
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  body * {
    visibility: hidden !important;
  }

  .print-document,
  .print-document * {
    visibility: visible !important;
  }

  .print-document {
    display: block !important;
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 210mm !important;
    min-height: 297mm !important;
    background: white !important;
    color: #142033 !important;
    z-index: 999999 !important;
    font-family: Arial, Helvetica, sans-serif !important;
    box-sizing: border-box !important;
  }

  .print-page {
    width: 210mm;
    min-height: 297mm;
    box-sizing: border-box;
    padding: 15mm 15mm 13mm;
    background: #fff;
  }

  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #0b5b92;
    padding-bottom: 8mm;
    margin-bottom: 7mm;
  }

  .print-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .print-logo {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #0b5b92;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
  }

  .print-brand-name {
    font-size: 22px;
    font-weight: 800;
    color: #0b5b92;
    line-height: 1.05;
  }

  .print-brand-sub {
    font-size: 10px;
    letter-spacing: 1.6px;
    color: #64748b;
    margin-top: 3px;
    text-transform: uppercase;
  }

  .print-number {
    text-align: right;
  }

  .print-number strong {
    display: block;
    font-size: 15px;
    color: #0b5b92;
    margin-bottom: 5px;
  }

  .print-number span {
    display: block;
    font-size: 10px;
    color: #475569;
    margin-top: 2px;
  }

  .print-section {
    margin-bottom: 6mm;
  }

  .print-section-title {
    font-size: 12px;
    font-weight: 800;
    color: #0b5b92;
    margin-bottom: 3mm;
    text-transform: uppercase;
  }

  .print-client {
    border: 1px solid #dbe3ec;
    border-radius: 7px;
    padding: 4mm;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3mm 8mm;
    background: #fbfdff;
  }

  .print-field label {
    display: block;
    font-size: 8px;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 1mm;
    font-weight: 700;
  }

  .print-field span {
    display: block;
    font-size: 10px;
    color: #172033;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5px;
  }

  .print-table th {
    background: #eaf2f8;
    color: #1e3a52;
    font-size: 8px;
    text-align: left;
    padding: 2.5mm 2mm;
    border: 1px solid #d5e0e9;
    font-weight: 800;
  }

  .print-table td {
    padding: 2.2mm 2mm;
    border: 1px solid #dbe3ec;
    color: #253246;
    vertical-align: middle;
  }

  .print-table td.money-cell {
    text-align: right;
    white-space: nowrap;
  }

  .print-service {
    margin-bottom: 5mm;
    page-break-inside: avoid;
  }

  .print-service-title {
    font-size: 10px;
    font-weight: 800;
    color: #172033;
    margin-bottom: 2mm;
  }

  .print-service-subtotal {
    text-align: right;
    font-size: 9px;
    margin-top: 2mm;
    color: #334155;
  }

  .print-service-subtotal strong {
    color: #0b5b92;
    font-size: 10px;
    margin-left: 8px;
  }

  .print-total {
    margin-top: 6mm;
    background: #e8f2fb;
    border: 1px solid #c5dceb;
    border-radius: 7px;
    padding: 5mm 6mm;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .print-total span {
    font-size: 11px;
    font-weight: 800;
    color: #0b5b92;
    text-transform: uppercase;
  }

  .print-total strong {
    font-size: 19px;
    color: #0b5b92;
  }

  .print-bottom {
    margin-top: 7mm;
    display: grid;
    grid-template-columns: 1fr 55mm;
    gap: 10mm;
    align-items: end;
  }

  .print-conditions {
    font-size: 8.5px;
    color: #475569;
    line-height: 1.55;
  }

  .print-conditions-title {
    font-weight: 800;
    font-size: 10px;
    color: #172033;
    margin-bottom: 2mm;
  }

  .print-conditions ul {
    margin: 0;
    padding-left: 15px;
  }

  .print-signature {
    text-align: center;
    color: #0b5b92;
    font-style: italic;
    font-size: 14px;
    padding-bottom: 2mm;
  }

  .print-signature-line {
    border-top: 1px solid #9fb5c7;
    margin-top: 10mm;
    padding-top: 2mm;
    color: #64748b;
    font-size: 8px;
    font-style: normal;
  }

  .print-footer {
    margin-top: 7mm;
    padding-top: 3mm;
    border-top: 1px solid #e2e8f0;
    text-align: center;
    color: #94a3b8;
    font-size: 7px;
  }
}
`;

function PrintDocument({ quote, items, company }) {
  const client = quote.refrig_clients || {};

  const equipmentMap = new Map();

  items.forEach((item) => {
    const eq = item.refrig_equipment;

    if (!eq) return;

    const key = eq.id || `${eq.equipment_type}-${eq.brand}-${eq.model}-${eq.capacity}`;

    if (!equipmentMap.has(key)) {
      equipmentMap.set(key, {
        ...eq,
        quantity: 1
      });
    }
  });

  const equipments = Array.from(equipmentMap.values());

  const groupedServices = items.reduce((groups, item) => {
    const name = item.service_name || 'Serviço';

    if (!groups[name]) {
      groups[name] = [];
    }

    groups[name].push(item);

    return groups;
  }, {});

  const serviceGroups = Object.entries(groupedServices);

  const validity = quote.validity_days || 7;

  return (
    <div className="print-document">
      <div className="print-page">

        {/* CABEÇALHO */}
        <div className="print-header">
          <div className="print-brand">
            <div className="print-logo">❄</div>

            <div>
              <div className="print-brand-name">
                {company?.company_name || 'Frios&Clima'}
              </div>

              <div className="print-brand-sub">
                Refrigeração
              </div>
            </div>
          </div>

          <div className="print-number">
            <strong>
              ORÇAMENTO Nº {String(quote.quote_number).padStart(4, '0')}
            </strong>

            <span>
              Data: {dateBR(quote.issue_date || quote.created_at?.slice(0, 10))}
            </span>

            <span>
              Validade: {validity} dias
            </span>
          </div>
        </div>

        {/* CLIENTE */}
        <section className="print-section">
          <div className="print-section-title">
            Cliente
          </div>

          <div className="print-client">

            <div className="print-field">
              <label>Nome</label>
              <span>{client.name || '—'}</span>
            </div>

            <div className="print-field">
              <label>Telefone</label>
              <span>{client.phone || client.whatsapp || '—'}</span>
            </div>

            <div className="print-field">
              <label>WhatsApp</label>
              <span>{client.whatsapp || '—'}</span>
            </div>

            <div className="print-field">
              <label>E-mail</label>
              <span>{client.email || '—'}</span>
            </div>

            <div className="print-field" style={{ gridColumn: '1 / -1' }}>
              <label>Endereço</label>
              <span>{client.address || '—'}</span>
            </div>

          </div>
        </section>

        {/* EQUIPAMENTOS */}
        {equipments.length > 0 && (
          <section className="print-section">

            <div className="print-section-title">
              Equipamentos
            </div>

            <table className="print-table">
              <thead>
                <tr>
                  <th style={{ width: '7%' }}>Nº</th>
                  <th style={{ width: '20%' }}>Tipo</th>
                  <th style={{ width: '23%' }}>Marca / Modelo</th>
                  <th style={{ width: '18%' }}>Capacidade</th>
                  <th>Observação</th>
                </tr>
              </thead>

              <tbody>
                {equipments.map((eq, index) => (
                  <tr key={index}>
                    <td>{String(index + 1).padStart(2, '0')}</td>

                    <td>
                      {eq.equipment_type || '—'}
                    </td>

                    <td>
                      {[eq.brand, eq.model]
                        .filter(Boolean)
                        .join(' / ') || '—'}
                    </td>

                    <td>
                      {eq.capacity || '—'}
                    </td>

                    <td>
                      {eq.observation || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </section>
        )}

        {/* SERVIÇOS */}
        <section className="print-section">

          <div className="print-section-title">
            Serviços
          </div>

          {serviceGroups.map(([serviceName, serviceItems], serviceIndex) => {

            const subtotal = serviceItems.reduce(
              (sum, item) =>
                sum +
                Number(item.quantity || 0) *
                Number(item.unit_final_value || 0),
              0
            );

            return (
              <div
                className="print-service"
                key={serviceName}
              >

                <div className="print-service-title">
                  {serviceIndex + 1}. {serviceName}
                </div>

                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Equipamento</th>
                      <th style={{ width: '8%' }}>Qtd.</th>
                      <th style={{ width: '17%' }}>Valor original</th>
                      <th style={{ width: '15%' }}>Desconto</th>
                      <th style={{ width: '17%' }}>Valor final</th>
                      <th style={{ width: '15%' }}>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {serviceItems.map((item) => {

                      const eq = item.refrig_equipment || {};

                      const original =
                        Number(item.unit_original_value || 0);

                      const discount =
                        Number(item.unit_discount || 0);

                      const final =
                        Number(item.unit_final_value || 0);

                      const itemTotal =
                        Number(item.quantity || 0) * final;

                      const equipmentName = [
                        eq.equipment_type,
                        eq.brand,
                        eq.model,
                        eq.capacity
                      ]
                        .filter(Boolean)
                        .join(' - ') || 'Equipamento';

                      return (
                        <tr key={item.id}>

                          <td>
                            {equipmentName}
                          </td>

                          <td>
                            {item.quantity || 1}
                          </td>

                          <td className="money-cell">
                            {money(original)}
                          </td>

                          <td className="money-cell">
                            {money(discount)}
                          </td>

                          <td className="money-cell">
                            {money(final)}
                          </td>

                          <td className="money-cell">
                            <strong>
                              {money(itemTotal)}
                            </strong>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="print-service-subtotal">
                  Subtotal do serviço:
                  <strong>{money(subtotal)}</strong>
                </div>

              </div>
            );
          })}

        </section>

        {/* TOTAL */}
        <div className="print-total">
          <span>
            Valor total do orçamento
          </span>

          <strong>
            {money(quote.total_final)}
          </strong>
        </div>

        {/* CONDIÇÕES */}
        <div className="print-bottom">

          <div className="print-conditions">

            <div className="print-conditions-title">
              Condições
            </div>

            <ul>
              <li>
                Orçamento referente exclusivamente aos serviços descritos.
              </li>

              <li>
                Peças, reparos e materiais adicionais, caso necessários,
                serão cobrados à parte.
              </li>

              <li>
                Validade do orçamento: {validity} dias.
              </li>

              <li>
                Forma de pagamento: a combinar.
              </li>

              {quote.notes && (
                <li>
                  {quote.notes}
                </li>
              )}
            </ul>

          </div>

          <div className="print-signature">

            Obrigado
            <br />
            pela confiança!

            <div className="print-signature-line">
              {company?.company_name || 'Frios&Clima Refrigeração'}
            </div>

          </div>

        </div>

        <div className="print-footer">
          {company?.phone && `Telefone: ${company.phone}`}
          {company?.phone && company?.email && ' • '}
          {company?.email && company.email}
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

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

    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {

        const { data, error: err } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (err) throw err;

        onAuth(data.session);

      } else if (mode === 'signup') {

        const { data, error: err } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name
              }
            }
          });

        if (err) throw err;

        if (!data.session) {
          setMessage(
            'Cadastro criado. Verifique seu e-mail para confirmar o acesso.'
          );
        } else {
          onAuth(data.session);
        }

      } else {

        const { error: err } =
          await supabase.auth.resetPasswordForEmail(
            email,
            {
              redirectTo: window.location.origin
            }
          );

        if (err) throw err;

        setMessage(
          'Enviamos um link de recuperação para seu e-mail.'
        );
      }

    } catch (err) {
      setError(
        err.message ||
        'Não foi possível concluir a operação.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <div className="brandmark">F</div>

          <div>
            <strong>Frios&Clima</strong>
            <small>Refrigeração</small>
          </div>
        </div>

        <div className="auth-copy">
          <h1>
            {mode === 'login'
              ? 'Bem-vindo de volta'
              : mode === 'signup'
                ? 'Criar acesso'
                : 'Recuperar senha'}
          </h1>

          <p>
            {mode === 'login'
              ? 'Entre para acompanhar seus orçamentos e serviços.'
              : mode === 'signup'
                ? 'Crie o acesso do responsável pelo sistema.'
                : 'Informe seu e-mail para receber o link de recuperação.'}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="auth-form"
        >

          {mode === 'signup' && (
            <label>
              Nome
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome do responsável"
                required
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </label>

          {mode !== 'reset' && (
            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                minLength={6}
                required
              />
            </label>
          )}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {message && (
            <div className="form-success">
              {message}
            </div>
          )}

          <button
            className="primary full"
            disabled={loading}
          >
            {loading
              ? <LoaderCircle className="spin" size={18} />
              : <LockKeyhole size={18} />}

            {mode === 'login'
              ? 'Entrar'
              : mode === 'signup'
                ? 'Criar conta'
                : 'Enviar link'}
          </button>

        </form>

        <div className="auth-links">

          {mode === 'login' && (
            <>
              <button onClick={() => setMode('reset')}>
                Esqueci minha senha
              </button>

              <span>·</span>

              <button onClick={() => setMode('signup')}>
                Criar conta
              </button>
            </>
          )}

          {mode !== 'login' && (
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setMessage('');
              }}
            >
              Voltar para login
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState('home');
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setChecking(false);
      });

    const {
      data: listener
    } = supabase.auth.onAuthStateChange(
      (_event, next) => setSession(next)
    );

    return () =>
      listener.subscription.unsubscribe();

  }, []);

  const go = (p) => {
    setPage(p);
    setSelected(null);
    setMobile(false);
  };

  const refreshData = () =>
    setRefresh(v => v + 1);

  if (checking) {
    return <Loading label="Conectando..." />;
  }

  if (!session) {
    return <Auth onAuth={setSession} />;
  }

  return (
    <>
      <style>{printStyles}</style>

      <div className="app">

        <aside
          className={`sidebar ${mobile ? 'open' : ''}`}
        >

          <div className="brand">
            <div className="brandmark">F</div>

            <div>
              <strong>Frios&Clima</strong>
              <small>Refrigeração</small>
            </div>

            <button
              className="close"
              onClick={() => setMobile(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="profile">

            <div className="avatar">
              FC
            </div>

            <div>
              <strong>
                {session.user.user_metadata?.full_name ||
                  session.user.email?.split('@')[0] ||
                  'Administrador'}
              </strong>

              <small>
                Administrador
              </small>
            </div>

          </div>

          <nav>
            {nav.map(
              ([id, label, Icon]) => (
                <button
                  key={id}
                  className={
                    page === id && !selected
                      ? 'active'
                      : ''
                  }
                  onClick={() => go(id)}
                >
                  <Icon size={19} />
                  <span>{label}</span>
                </button>
              )
            )}
          </nav>

          <div className="sidebar-bottom">

            <button
              onClick={() =>
                supabase.auth.signOut()
              }
            >
              <LogOut size={18} />
              Sair
            </button>

          </div>

        </aside>

        {mobile && (
          <div
            className="overlay"
            onClick={() => setMobile(false)}
          />
        )}

        <main className="main">

          <header>

            <button
              className="menu"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>

            <div className="header-search">
              <Search size={18} />

              <input
                value={search}
                onChange={e =>
                  setSearch(e.target.value)
                }
                placeholder="Buscar orçamento, cliente..."
              />
            </div>

            <div className="header-user">

              <div className="avatar small">
                FC
              </div>

              <span>
                Frios&Clima
              </span>

            </div>

          </header>

          {selected ? (
            <QuoteDetail
              quote={selected}
              back={() => setSelected(null)}
              onChanged={refreshData}
            />
          ) : page === 'newQuote' ? (
            <NewQuote go={go} />
          ) : page === 'home' ? (
            <Home
              go={go}
              setSelected={setSelected}
              refresh={refresh}
            />
          ) : page === 'quotes' ? (
            <Quotes
              search={search}
              setSelected={setSelected}
              go={go}
              refresh={refresh}
            />
          ) : page === 'finance' ? (
            <Finance
              setSelected={setSelected}
              refresh={refresh}
            />
          ) : page === 'tickets' ? (
            <Tickets
              setSelected={setSelected}
              refresh={refresh}
            />
          ) : (
            <SettingsPage
              refresh={refreshData}
            />
          )}

        </main>

      </div>
    </>
  );
}

function PageHead({
  title,
  sub,
  action
}) {
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

function useQuotes(refresh) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    let alive = true;

    (async () => {

      setLoading(true);

      const {
        data,
        error
      } = await supabase
        .from('refrig_quotes')
        .select(
          '*, refrig_clients(name, phone, whatsapp, email, address)'
        )
        .order(
          'created_at',
          { ascending: false }
        );

      if (alive) {
        setQuotes(data || []);
        setError(error?.message || '');
        setLoading(false);
      }

    })();

    return () => {
      alive = false;
    };

  }, [refresh]);

  return {
    quotes,
    loading,
    error
  };
}

function Home({
  go,
  setSelected,
  refresh
}) {
  const {
    quotes,
    loading,
    error
  } = useQuotes(refresh);

  const counts = useMemo(
    () => ({
      aguardando_resposta:
        quotes.filter(
          q => q.status === 'aguardando_resposta'
        ).length,

      aprovado:
        quotes.filter(
          q => q.status === 'aprovado'
        ).length,

      em_andamento:
        quotes.filter(
          q => q.status === 'em_andamento'
        ).length,

      concluido:
        quotes.filter(
          q => q.status === 'concluido'
        ).length,
    }),
    [quotes]
  );

  const attention =
    quotes
      .filter(
        q => q.status === 'aguardando_resposta'
      )
      .slice(0, 5);

  const approved =
    quotes.filter(
      q =>
        [
          'aprovado',
          'em_andamento',
          'concluido'
        ].includes(q.status)
    );

  const total =
    approved.reduce(
      (a, q) =>
        a + Number(q.total_final || 0),
      0
    );

  return (
    <div className="content">

      <PageHead
        title="Olá, Frios&Clima 👋"
        sub="Acompanhe seus orçamentos e serviços de hoje."
        action={
          <button
            className="primary"
            onClick={() => go('newQuote')}
          >
            <Plus size={18} />
            Novo orçamento
          </button>
        }
      />

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="stats">

        <Stat
          icon={Clock3}
          label="Aguardando resposta"
          value={String(
            counts.aguardando_resposta
          ).padStart(2, '0')}
          tone="orange"
        />

        <Stat
          icon={CheckCircle2}
          label="Aprovados"
          value={String(
            counts.aprovado
          ).padStart(2, '0')}
          tone="green"
        />

        <Stat
          icon={PlayCircle}
          label="Em andamento"
          value={String(
            counts.em_andamento
          ).padStart(2, '0')}
          tone="blue"
        />

        <Stat
          icon={PackageCheck}
          label="Concluídos"
          value={String(
            counts.concluido
          ).padStart(2, '0')}
          tone="purple"
        />

      </div>

      <section className="panel">

        <div className="panel-head">

          <div>
            <h2>
              Orçamentos que precisam de atenção
            </h2>

            <p>
              Acompanhe os clientes que ainda não responderam.
            </p>
          </div>

          <button
            className="link"
            onClick={() => go('quotes')}
          >
            Ver todos
            <ChevronRight size={16} />
          </button>

        </div>

        {loading ? (
          <Loading />
        ) : attention.length ? (
          attention.map(q => (
            <div
              className="attention"
              key={q.id}
            >

              <div className="attention-icon">
                <AlertCircle size={20} />
              </div>

              <div className="grow">

                <strong>
                  ORC-
                  {String(q.quote_number).padStart(4, '0')}
                  {' · '}
                  {q.refrig_clients?.name || 'Cliente'}
                </strong>

                <span>
                  Orçamento criado em{' '}
                  {dateBR(q.issue_date)}
                </span>

              </div>

              <strong>
                {money(q.total_final)}
              </strong>

              <Badge status={q.status} />

              <button
                className="iconbtn"
                onClick={() =>
                  setSelected(q)
                }
              >
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
            <h2>
              Resumo financeiro
            </h2>

            <p>
              Valores dos orçamentos aprovados, em andamento e concluídos.
            </p>
          </div>

          <button
            className="link"
            onClick={() => go('finance')}
          >
            Ver financeiro
            <ChevronRight size={16} />
          </button>

        </div>

        <div className="finance-summary">

          <div>
            <span>Total aprovado</span>
            <strong>
              {money(total)}
            </strong>
          </div>

          <div>
            <span>Serviços aprovados</span>
            <strong>
              {approved.length}
            </strong>
          </div>

          <div>
            <span>Ticket médio</span>
            <strong>
              {money(
                approved.length
                  ? total / approved.length
                  : 0
              )}
            </strong>
          </div>

        </div>

      </section>

    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone
}) {
  return (
    <div className="stat">

      <div className={`stat-icon ${tone}`}>
        <Icon size={20} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

function Empty({
  title,
  text
}) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function Quotes({
  search,
  setSelected,
  go,
  refresh
}) {
  const {
    quotes,
    loading,
    error
  } = useQuotes(refresh);

  const [filter, setFilter] =
    useState('todos');

  const filtered =
    quotes.filter(
      q =>
        (filter === 'todos' ||
          q.status === filter) &&
        `${q.quote_number} ${
          q.refrig_clients?.name || ''
        } ${q.status}`
          .toLowerCase()
          .includes(search.toLowerCase())
    );

  return (
    <div className="content">

      <PageHead
        title="Orçamentos"
        sub="Crie, acompanhe e organize suas propostas."
        action={
          <button
            className="primary"
            onClick={() => go('newQuote')}
          >
            <Plus size={18} />
            Novo orçamento
          </button>
        }
      />

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="toolbar">

        <div className="tabs">

          {[
            ['todos', 'Todos'],
            ['aguardando_resposta', 'Aguardando'],
            ['aprovado', 'Aprovados'],
            ['em_andamento', 'Em andamento'],
            ['concluido', 'Concluídos'],
            ['recusado', 'Recusados']
          ].map(
            ([id, label]) => (
              <button
                key={id}
                className={
                  filter === id
                    ? 'selected'
                    : ''
                }
                onClick={() =>
                  setFilter(id)
                }
              >
                {label}
                <b>
                  {id === 'todos'
                    ? quotes.length
                    : quotes.filter(
                        q => q.status === id
                      ).length}
                </b>
              </button>
            )
          )}

        </div>

        <button className="filter">
          <SlidersHorizontal size={17} />
          Filtros
        </button>

      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="tablepanel">

          <table>

            <thead>
              <tr>
                <th>Orçamento</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {filtered.map(q => (
                <tr
                  key={q.id}
                  onClick={() =>
                    setSelected(q)
                  }
                >

                  <td>
                    <strong>
                      ORC-
                      {String(
                        q.quote_number
                      ).padStart(4, '0')}
                    </strong>
                  </td>

                  <td>
                    {q.refrig_clients?.name ||
                      'Cliente'}
                  </td>

                  <td>
                    {dateBR(q.issue_date)}
                  </td>

                  <td>
                    <strong>
                      {money(q.total_final)}
                    </strong>
                  </td>

                  <td>
                    <Badge status={q.status} />
                  </td>

                  <td>
                    <button className="iconbtn">
                      <MoreHorizontal size={19} />
                    </button>
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
      )}

      <div className="mobile-cards">

        {filtered.map(q => (
          <div
            className="quote-card"
            key={q.id}
            onClick={() =>
              setSelected(q)
            }
          >

            <div>
              <strong>
                ORC-
                {String(
                  q.quote_number
                ).padStart(4, '0')}
              </strong>

              <Badge status={q.status} />
            </div>

            <h3>
              {q.refrig_clients?.name ||
                'Cliente'}
            </h3>

            <p>
              {dateBR(q.issue_date)}
            </p>

            <strong>
              {money(q.total_final)}
            </strong>

          </div>
        ))}

      </div>

    </div>
  );
}

/* =========================================================
   NOVO ORÇAMENTO
   ========================================================= */

function NewQuote({ go }) {

  const [client, setClient] =
    useState({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      notes: ''
    });

  const [equipment, setEquipment] =
    useState([
      {
        type: '',
        brand: '',
        model: '',
        capacity: '',
        observation: ''
      }
    ]);

  const [items, setItems] =
    useState([
      {
        equipmentIndex: 0,
        service_name: 'Lavagem completa',
        service_description: '',
        quantity: 1,
        original: '',
        discount: '',
        final: ''
      }
    ]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const addEquipment = () => {

    const next = [
      ...equipment,
      {
        type: '',
        brand: '',
        model: '',
        capacity: '',
        observation: ''
      }
    ];

    setEquipment(next);

    setItems([
      ...items,
      {
        equipmentIndex: next.length - 1,
        service_name: '',
        service_description: '',
        quantity: 1,
        original: '',
        discount: '',
        final: ''
      }
    ]);
  };

  const addItem = () =>
    setItems([
      ...items,
      {
        equipmentIndex: 0,
        service_name: '',
        service_description: '',
        quantity: 1,
        original: '',
        discount: '',
        final: ''
      }
    ]);

  const updateEquipment = (
    i,
    key,
    value
  ) =>
    setEquipment(
      equipment.map(
        (e, idx) =>
          idx === i
            ? {
                ...e,
                [key]: value
              }
            : e
      )
    );

  const updateItem = (
    i,
    key,
    value
  ) =>
    setItems(
      items.map(
        (it, idx) =>
          idx === i
            ? {
                ...it,
                [key]: value
              }
            : it
      )
    );

  const total =
    items.reduce(
      (sum, it) =>
        sum +
        Number(it.quantity || 0) *
        Number(it.final || 0),
      0
    );

  async function save() {

    setError('');

    if (!client.name.trim()) {
      return setError(
        'Informe o nome do cliente.'
      );
    }

    if (
      equipment.some(
        e => !e.type.trim()
      )
    ) {
      return setError(
        'Informe o tipo de todos os equipamentos.'
      );
    }

    if (
      !items.length ||
      items.some(
        i =>
          !i.service_name.trim() ||
          !i.final
      )
    ) {
      return setError(
        'Informe o serviço e o valor final de cada item.'
      );
    }

    setSaving(true);

    try {

      const {
        data: auth
      } = await supabase.auth.getUser();

      const owner_id =
        auth.user.id;

      const {
        data: c,
        error: ce
      } = await supabase
        .from('refrig_clients')
        .insert({
          owner_id,
          ...client
        })
        .select()
        .single();

      if (ce) throw ce;

      const {
        data: eq,
        error: ee
      } = await supabase
        .from('refrig_equipment')
        .insert(
          equipment.map(e => ({
            owner_id,
            client_id: c.id,
            equipment_type: e.type,
            brand: e.brand,
            model: e.model,
            capacity: e.capacity,
            observation: e.observation
          }))
        )
        .select()
        .order('created_at');

      if (ee) throw ee;

      const {
        data: q,
        error: qe
      } = await supabase
        .from('refrig_quotes')
        .insert({
          owner_id,
          client_id: c.id,
          notes: client.notes,

          total_original:
            items.reduce(
              (s, i) =>
                s +
                Number(i.quantity || 0) *
                Number(i.original || 0),
              0
            ),

          total_discount:
            items.reduce(
              (s, i) =>
                s +
                Number(i.quantity || 0) *
                Number(i.discount || 0),
              0
            ),

          total_final: total
        })
        .select()
        .single();

      if (qe) throw qe;

      const rows =
        items.map(i => ({
          quote_id: q.id,
          equipment_id:
            eq[i.equipmentIndex].id,
          service_name:
            i.service_name,
          service_description:
            i.service_description,
          quantity:
            Number(i.quantity || 1),
          unit_original_value:
            Number(i.original || 0),
          unit_discount:
            Number(i.discount || 0),
          unit_final_value:
            Number(i.final || 0)
        }));

      const {
        error: ie
      } = await supabase
        .from('refrig_quote_items')
        .insert(rows);

      if (ie) throw ie;

      go('quotes');

    } catch (e) {

      setError(
        e.message ||
        'Não foi possível salvar o orçamento.'
      );

    } finally {

      setSaving(false);

    }
  }

  return (
    <div className="content">

      <button
        className="back"
        onClick={() => go('quotes')}
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <PageHead
        title="Criar orçamento"
        sub="Monte uma proposta com serviços e valores por equipamento."
        action={
          <button
            className="primary"
            onClick={save}
            disabled={saving}
          >
            {saving
              ? <LoaderCircle className="spin" size={18} />
              : <Save size={18} />}

            Salvar orçamento
          </button>
        }
      />

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <section className="panel form-section">

        <div className="panel-head">

          <div>
            <h2>1. Cliente</h2>
            <p>
              Quem receberá o orçamento.
            </p>
          </div>

        </div>

        <div className="form-grid">

          {[
            ['name', 'Nome', 'text'],
            ['phone', 'Telefone', 'text'],
            ['whatsapp', 'WhatsApp', 'text'],
            ['email', 'E-mail', 'email'],
            ['address', 'Endereço', 'text']
          ].map(
            ([k, l, t]) => (
              <label key={k}>
                {l}

                <input
                  type={t}
                  value={client[k]}
                  onChange={e =>
                    setClient({
                      ...client,
                      [k]: e.target.value
                    })
                  }
                />
              </label>
            )
          )}

        </div>

        <label>
          Observações

          <textarea
            value={client.notes}
            onChange={e =>
              setClient({
                ...client,
                notes: e.target.value
              })
            }
          />

        </label>

      </section>

      <section className="panel form-section">

        <div className="panel-head">

          <div>
            <h2>2. Equipamentos</h2>

            <p>
              Cadastre cada equipamento que receberá serviço.
            </p>
          </div>

          <button
            className="secondary"
            onClick={addEquipment}
          >
            <Plus size={16} />
            Adicionar equipamento
          </button>

        </div>

        {equipment.map(
          (e, i) => (
            <div
              className="equipment-form"
              key={i}
            >

              <div className="mini-index">
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className="form-grid equipment-fields">

                <label>
                  Tipo*
                  <input
                    value={e.type}
                    onChange={ev =>
                      updateEquipment(
                        i,
                        'type',
                        ev.target.value
                      )
                    }
                    placeholder="Ex.: Piso-Teto"
                  />
                </label>

                <label>
                  Marca
                  <input
                    value={e.brand}
                    onChange={ev =>
                      updateEquipment(
                        i,
                        'brand',
                        ev.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Modelo
                  <input
                    value={e.model}
                    onChange={ev =>
                      updateEquipment(
                        i,
                        'model',
                        ev.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Capacidade
                  <input
                    value={e.capacity}
                    onChange={ev =>
                      updateEquipment(
                        i,
                        'capacity',
                        ev.target.value
                      )
                    }
                    placeholder="60.000 BTU"
                  />
                </label>

              </div>

            </div>
          )
        )}

      </section>

      <section className="panel form-section">

        <div className="panel-head">

          <div>
            <h2>3. Serviços</h2>

            <p>
              O mesmo equipamento pode ter vários serviços e cada combinação tem seu próprio preço.
            </p>
          </div>

          <button
            className="secondary"
            onClick={addItem}
          >
            <Plus size={16} />
            Adicionar serviço
          </button>

        </div>

        {items.map(
          (it, i) => (
            <div
              className="service-editor"
              key={i}
            >

              <div className="service-editor-head">

                <strong>
                  Serviço {String(i + 1).padStart(2, '0')}
                </strong>

                <button
                  className="iconbtn"
                  onClick={() =>
                    setItems(
                      items.filter(
                        (_, idx) =>
                          idx !== i
                      )
                    )
                  }
                  disabled={
                    items.length === 1
                  }
                >
                  <Trash2 size={17} />
                </button>

              </div>

              <div className="form-grid">

                <label>
                  Equipamento

                  <select
                    value={it.equipmentIndex}
                    onChange={e =>
                      updateItem(
                        i,
                        'equipmentIndex',
                        Number(e.target.value)
                      )
                    }
                  >
                    {equipment.map(
                      (e, idx) => (
                        <option
                          key={idx}
                          value={idx}
                        >
                          {idx + 1}.{' '}
                          {e.type ||
                            'Equipamento'}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Serviço*

                  <input
                    value={it.service_name}
                    onChange={e =>
                      updateItem(
                        i,
                        'service_name',
                        e.target.value
                      )
                    }
                    placeholder="Lavagem completa"
                  />
                </label>

                <label>
                  Quantidade

                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={e =>
                      updateItem(
                        i,
                        'quantity',
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Valor original

                  <input
                    type="number"
                    step="0.01"
                    value={it.original}
                    onChange={e =>
                      updateItem(
                        i,
                        'original',
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Desconto

                  <input
                    type="number"
                    step="0.01"
                    value={it.discount}
                    onChange={e =>
                      updateItem(
                        i,
                        'discount',
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Valor final*

                  <input
                    type="number"
                    step="0.01"
                    value={it.final}
                    onChange={e =>
                      updateItem(
                        i,
                        'final',
                        e.target.value
                      )
                    }
                  />
                </label>

              </div>

              <div className="item-total">
                Total do item

                <strong>
                  {money(
                    Number(it.quantity || 0) *
                    Number(it.final || 0)
                  )}
                </strong>
              </div>

            </div>
          )
        )}

      </section>

      <section className="panel total-box">

        <span>
          Total do orçamento
        </span>

        <strong>
          {money(total)}
        </strong>

      </section>

    </div>
  );
}

/* =========================================================
   DETALHE DO ORÇAMENTO + PDF
   ========================================================= */

function QuoteDetail({
  quote,
  back,
  onChanged
}) {

  const [saving, setSaving] =
    useState(false);

  const [status, setStatus] =
    useState(quote.status);

  const [items, setItems] =
    useState([]);

  const [company, setCompany] =
    useState(null);

  useEffect(() => {

    async function load() {

      const {
        data: itemData
      } = await supabase
        .from('refrig_quote_items')
        .select(
          '*, refrig_equipment(id,equipment_type,brand,model,capacity,observation)'
        )
        .eq('quote_id', quote.id);

      setItems(itemData || []);

      const {
        data: auth
      } = await supabase.auth.getUser();

      if (auth?.user) {

        const {
          data: companyData
        } = await supabase
          .from('refrig_company')
          .select('*')
          .eq(
            'owner_id',
            auth.user.id
          )
          .maybeSingle();

        setCompany(
          companyData || null
        );
      }
    }

    load();

  }, [quote.id]);

  async function changeStatus(next) {

    setSaving(true);

    const {
      error
    } = await supabase
      .from('refrig_quotes')
      .update({
        status: next
      })
      .eq(
        'id',
        quote.id
      );

    if (!error) {

      setStatus(next);
      onChanged();

    } else {

      alert(error.message);

    }

    setSaving(false);
  }

  const client =
    quote.refrig_clients || {};

  function generatePDF() {
    window.print();
  }

  return (
    <div className="content">

      {/* DOCUMENTO QUE SÓ APARECE NA IMPRESSÃO/PDF */}
      <PrintDocument
        quote={quote}
        items={items}
        company={company}
      />

      <button
        className="back"
        onClick={back}
      >
        <ArrowLeft size={18} />
        Voltar para orçamentos
      </button>

      <PageHead
        title={`ORC-${String(
          quote.quote_number
        ).padStart(4, '0')}`}
        sub="Detalhes do orçamento"
        action={
          <div className="actions">

            <button className="secondary">
              <Pencil size={17} />
              Editar
            </button>

            <button
              className="secondary"
              onClick={generatePDF}
            >
              <Download size={17} />
              PDF
            </button>

            <button className="primary">
              <MessageCircle size={17} />
              WhatsApp
            </button>

          </div>
        }
      />

      <div className="detail-grid">

        <section className="panel">

          <div className="panel-head">

            <div>
              <h2>Cliente</h2>
              <p>Dados do solicitante</p>
            </div>

            <Badge status={status} />

          </div>

          <div className="info-grid">

            <Info
              icon={UserRound}
              label="Nome"
              value={client.name || '—'}
            />

            <Info
              icon={Phone}
              label="Telefone"
              value={client.phone || '—'}
            />

            <Info
              icon={MapPin}
              label="Endereço"
              value={client.address || '—'}
            />

            <Info
              icon={Mail}
              label="E-mail"
              value={client.email || '—'}
            />

          </div>

        </section>

        <section className="panel">

          <div className="panel-head">

            <div>
              <h2>Serviços</h2>
              <p>Composição do orçamento</p>
            </div>

          </div>

          {items.map(i => {

            const totalItem =
              Number(i.quantity || 0) *
              Number(i.unit_final_value || 0);

            return (
              <div
                className="service-line"
                key={i.id}
              >

                <div>

                  <strong>
                    {i.service_name}
                  </strong>

                  <span>
                    {i.quantity} ×{' '}
                    {i.refrig_equipment?.equipment_type ||
                      'Equipamento'}{' '}
                    {i.refrig_equipment?.capacity || ''}
                  </span>

                </div>

                <strong>
                  {money(totalItem)}
                </strong>

              </div>
            );
          })}

          <div className="total">

            <span>Total</span>

            <strong>
              {money(quote.total_final)}
            </strong>

          </div>

        </section>

      </div>

      <section className="panel">

        <div className="panel-head">

          <div>
            <h2>Status</h2>
            <p>
              Atualize o andamento do orçamento.
            </p>
          </div>

        </div>

        <div className="status-actions">

          {[
            ['aguardando_resposta', 'Aguardando resposta'],
            ['aprovado', 'Aprovar'],
            ['recusado', 'Recusar'],
            ['em_andamento', 'Em andamento'],
            ['concluido', 'Concluir']
          ].map(
            ([id, label]) => (
              <button
                key={id}
                className={
                  status === id
                    ? 'selected'
                    : ''
                }
                disabled={saving}
                onClick={() =>
                  changeStatus(id)
                }
              >
                {label}
              </button>
            )
          )}

        </div>

      </section>

      {quote.notes && (
        <section className="panel">

          <h2>Observações</h2>

          <p className="note">
            {quote.notes}
          </p>

        </section>
      )}

    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value
}) {
  return (
    <div className="info">

      <Icon size={17} />

      <div>
        <small>{label}</small>
        <span>{value}</span>
      </div>

    </div>
  );
}

/* =========================================================
   FINANCEIRO
   ========================================================= */

function Finance({
  setSelected,
  refresh
}) {

  const {
    quotes,
    loading
  } = useQuotes(refresh);

  const approved =
    quotes.filter(
      q =>
        [
          'aprovado',
          'em_andamento',
          'concluido'
        ].includes(q.status)
    );

  const total =
    approved.reduce(
      (a, q) =>
        a + Number(q.total_final || 0),
      0
    );

  return (
    <div className="content">

      <PageHead
        title="Financeiro"
        sub="Acompanhe os valores dos serviços aprovados."
      />

      <div className="finance-cards">

        <div className="bigmetric">

          <span>Total aprovado</span>

          <strong>
            {money(total)}
          </strong>

          <small>
            Orçamentos aprovados, em andamento e concluídos.
          </small>

        </div>

        <div className="bigmetric">

          <span>Serviços aprovados</span>

          <strong>
            {approved.length}
          </strong>

          <small>
            Chamados vinculados ao orçamento.
          </small>

        </div>

      </div>

      <div className="tablepanel">

        <div className="table-title">

          <div>
            <h2>Movimentações</h2>

            <p>
              Clique em um item para consultar o orçamento.
            </p>
          </div>

        </div>

        {loading ? (
          <Loading />
        ) : (
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

              {approved.map(q => (
                <tr
                  key={q.id}
                  onClick={() =>
                    setSelected(q)
                  }
                >

                  <td>
                    <strong>
                      ORC-
                      {String(
                        q.quote_number
                      ).padStart(4, '0')}
                    </strong>
                  </td>

                  <td>
                    {q.refrig_clients?.name ||
                      'Cliente'}
                  </td>

                  <td>
                    {dateBR(q.issue_date)}
                  </td>

                  <td>
                    <Badge status={q.status} />
                  </td>

                  <td>
                    <strong>
                      {money(q.total_final)}
                    </strong>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   CHAMADOS
   ========================================================= */

function Tickets({
  setSelected,
  refresh
}) {

  const [tickets, setTickets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    supabase
      .from('refrig_service_calls')
      .select(
        '*, refrig_quotes(*, refrig_clients(name))'
      )
      .order(
        'created_at',
        { ascending: false }
      )
      .then(
        ({ data }) => {
          setTickets(data || []);
          setLoading(false);
        }
      );

  }, [refresh]);

  return (
    <div className="content">

      <PageHead
        title="Chamados"
        sub="Serviços aprovados e em execução."
      />

      <div className="ticket-filters">

        <button className="selected">
          Todos <b>{tickets.length}</b>
        </button>

        <button>
          Aprovados
        </button>

        <button>
          Em andamento
        </button>

        <button>
          Concluídos
        </button>

      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="ticket-list">

          {tickets.map(t => (

            <div
              className="ticket"
              key={t.id}
              onClick={() =>
                t.refrig_quotes &&
                setSelected(
                  t.refrig_quotes
                )
              }
            >

              <div className="ticket-num">
                CH-
                {String(
                  t.call_number
                ).padStart(4, '0')}
              </div>

              <div className="grow">

                <strong>
                  {t.refrig_quotes?.refrig_clients?.name ||
                    'Cliente'}
                </strong>

                <span>
                  ORC-
                  {String(
                    t.refrig_quotes?.quote_number || 0
                  ).padStart(4, '0')}
                </span>

              </div>

              <strong>
                {money(
                  t.refrig_quotes?.total_final
                )}
              </strong>

              <Badge
                status={
                  t.status === 'aprovado'
                    ? 'aprovado'
                    : t.status
                }
              />

              <ChevronRight size={18} />

            </div>

          ))}

          {!tickets.length && (
            <Empty
              title="Nenhum chamado ainda"
              text="Um chamado será criado automaticamente quando um orçamento for aprovado."
            />
          )}

        </div>
      )}

    </div>
  );
}

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

function SettingsPage({
  refresh
}) {

  const [company, setCompany] =
    useState({
      company_name: '',
      document: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: ''
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState('');

  useEffect(() => {

    supabase.auth
      .getUser()
      .then(async ({ data }) => {

        const {
          data: row
        } = await supabase
          .from('refrig_company')
          .select('*')
          .eq(
            'owner_id',
            data.user.id
          )
          .maybeSingle();

        if (row) {
          setCompany(row);
        } else {
          setCompany(c => ({
            ...c,
            email:
              data.user.email || ''
          }));
        }

        setLoading(false);

      });

  }, []);

  async function save() {

    setSaving(true);
    setMessage('');

    const {
      data
    } = await supabase.auth.getUser();

    const {
      error
    } = await supabase
      .from('refrig_company')
      .upsert(
        {
          ...company,
          owner_id: data.user.id
        },
        {
          onConflict: 'owner_id'
        }
      );

    setMessage(
      error
        ? error.message
        : 'Dados salvos com sucesso.'
    );

    setSaving(false);

    if (!error) {
      refresh();
    }
  }

  if (loading) {
    return (
      <div className="content">
        <Loading />
      </div>
    );
  }

  return (
    <div className="content">

      <PageHead
        title="Configurações"
        sub="Gerencie os dados que serão usados nos próximos orçamentos e PDFs."
      />

      <div className="settings-grid">

        <section className="panel">

          <div className="panel-head">

            <div>
              <h2>Perfil</h2>
              <p>Dados do acesso atual.</p>
            </div>

          </div>

          <label>
            E-mail

            <input
              value={company.email}
              readOnly
            />
          </label>

          <button
            className="secondary"
            onClick={() =>
              supabase.auth.resetPasswordForEmail(
                company.email,
                {
                  redirectTo:
                    window.location.origin
                }
              )
            }
          >
            Redefinir senha
          </button>

        </section>

        <section className="panel">

          <div className="panel-head">

            <div>
              <h2>Dados da empresa</h2>

              <p>
                Serão utilizados automaticamente nos documentos.
              </p>
            </div>

          </div>

          {[
            ['company_name', 'Nome da empresa'],
            ['document', 'CNPJ / CPF'],
            ['phone', 'Telefone'],
            ['whatsapp', 'WhatsApp'],
            ['address', 'Endereço']
          ].map(
            ([k, l]) => (
              <label key={k}>
                {l}

                <input
                  value={company[k] || ''}
                  onChange={e =>
                    setCompany({
                      ...company,
                      [k]: e.target.value
                    })
                  }
                />
              </label>
            )
          )}

          {message && (
            <div
              className={
                message.includes('sucesso')
                  ? 'form-success'
                  : 'form-error'
              }
            >
              {message}
            </div>
          )}

          <button
            className="primary"
            onClick={save}
            disabled={saving}
          >
            {saving
              ? <LoaderCircle className="spin" size={18} />
              : <Save size={18} />}

            Salvar dados
          </button>

        </section>

      </div>

    </div>
  );
}

createRoot(
  document.getElementById('root')
).render(
  <App />
);
