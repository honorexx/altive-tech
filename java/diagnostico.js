// Diagnóstico gratuito ALTIVE: perguntas em etapas, resultado na tela e envio das respostas.
(() => {
  // Cada diagnóstico concluído chega por e-mail em AVISAR (via FormSubmit; o primeiro envio pede
  // uma confirmação única no e-mail). ENDPOINT opcional: Apps Script que também grava numa planilha.
  const AVISAR = 'altivtech@gmail.com';
  const ENDPOINT = '';
  const WHATSAPP = '5541984801999';

  const form = document.getElementById('dg-form');
  if (!form) return;
  const etapas = [...form.querySelectorAll('.dg-etapa')];
  const barra = document.getElementById('dg-barra'), passo = document.getElementById('dg-passo');
  const erro = document.getElementById('dg-erro'), voltar = document.getElementById('dg-voltar'), avancar = document.getElementById('dg-avancar');
  const resultado = document.getElementById('dg-resultado');
  let atual = 0;

  const marcados = (nome) => [...form.querySelectorAll(`[name="${nome}"]:checked`)].map((i) => i.value);
  const rotulos = (nome) => [...form.querySelectorAll(`[name="${nome}"]:checked`)].map((i) => (i.nextElementSibling ? i.nextElementSibling.textContent.trim() : i.value)).join('; ');
  const valor = (nome) => (form.elements[nome] ? String(form.elements[nome].value || '').trim() : '');

  function mostrar(i) {
    atual = i;
    etapas.forEach((e, k) => e.classList.toggle('ativa', k === i));
    barra.style.width = `${(i / etapas.length) * 100}%`;
    passo.textContent = `Pergunta ${i + 1} de ${etapas.length}`;
    voltar.hidden = i === 0;
    avancar.textContent = i === etapas.length - 1 ? 'Ver meu diagnóstico →' : 'Avançar →';
    erro.textContent = '';
    const primeiro = etapas[i].querySelector('input,textarea');
    if (primeiro && i > 0) primeiro.focus({ preventScroll: true });
  }

  // limite de escolhas nas perguntas "até N"
  etapas.forEach((e) => {
    const max = Number(e.dataset.max || 0);
    if (!max) return;
    e.addEventListener('change', (ev) => {
      const ch = e.querySelectorAll('input:checked');
      if (ch.length > max) { ev.target.checked = false; erro.textContent = `Escolha no máximo ${max}.`; }
      else erro.textContent = '';
    });
  });

  function valida(i) {
    const e = etapas[i];
    if (e.classList.contains('dg-contato')) {
      if (!valor('nome') || !valor('empresa')) return 'Preencha seu nome e o nome da empresa.';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor('email'))) return 'Informe um e-mail válido.';
      if (valor('whatsapp').replace(/\D/g, '').length < 10) return 'Informe um telefone com DDD.';
      if (!form.elements.aceite.checked) return 'Marque a autorização para continuarmos.';
      return '';
    }
    return e.querySelector('input:checked') ? '' : 'Escolha pelo menos uma opção.';
  }

  avancar.addEventListener('click', () => {
    const msg = valida(atual);
    if (msg) { erro.textContent = msg; return; }
    if (atual < etapas.length - 1) { mostrar(atual + 1); window.scrollTo({ top: form.getBoundingClientRect().top + scrollY - 140, behavior: 'smooth' }); }
    else concluir();
  });
  voltar.addEventListener('click', () => atual > 0 && mostrar(atual - 1));
  form.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.tagName !== 'TEXTAREA') { ev.preventDefault(); avancar.click(); } });

  // ---------------------------------------------------------------- diagnóstico
  const RECS = {
    integrar: ['Centralizar e integrar a informação', 'Um painel único que conecta ERP, CRM, planilhas e WhatsApp acaba com a informação espalhada e com o retrabalho de digitar tudo duas vezes.'],
    ia: ['Responder clientes mais rápido com IA', 'Um assistente de IA responde as dúvidas comuns na hora, monta orçamentos e passa para a pessoa certa quando o cliente quer fechar.'],
    painel: ['Indicadores em tempo real', 'Um painel com os números do dia (vendas, pedidos, estoque) atualizado sozinho, sem relatório montado à mão.'],
    automacao: ['Automatizar tarefas repetitivas', 'Cadastros, cobranças, lembretes e relatórios podem rodar sozinhos, liberando o time para o que gera resultado.'],
    processo: ['Organizar processos e conhecimento', 'Um sistema que registra cada etapa do trabalho diminui a dependência de pessoas-chave e facilita treinar quem chega.'],
    site: ['Presença digital que traz clientes', 'Um site rápido, bem posicionado no Google e ligado ao WhatsApp transforma visitas em conversas de venda.'],
    comecar: ['Começar a usar IA no dia a dia', 'Assistentes simples para atendimento, textos e análises já trazem ganho de tempo sem mudar os sistemas da empresa.'],
  };

  function calcula() {
    const s = marcados('situacoes'), f = marcados('ferramentas'), sol = marcados('solucao'), areas = marcados('areas');
    const ia = Number((form.querySelector('[name="ia"]:checked') || {}).value || 0);
    const tam = (form.querySelector('[name="tamanho"]:checked') || {}).value || '';

    let nota = 35 + (f.includes('erp') ? 15 : 0) + (f.includes('crm') ? 10 : 0) + (f.includes('proprio') ? 5 : 0) - (f.includes('nenhum') ? 10 : 0) + ia * 8 - s.length * 4;
    nota = Math.max(12, Math.min(94, nota));
    const fase = nota < 40 ? ['No começo da jornada', 'Tem muito espaço para ganhar tempo e controle com pouco investimento.']
      : nota < 70 ? ['Em evolução', 'A base existe; agora o ganho está em conectar as ferramentas e automatizar o que é repetitivo.']
      : ['Bem estruturada', 'A empresa já tem uma base sólida; o próximo passo é IA e automação para escalar sem aumentar o time.'];

    const pontos = {};
    const soma = (k, p) => (pontos[k] = (pontos[k] || 0) + p);
    if (s.includes('planilhas')) soma('integrar', 3);
    if (s.includes('sistemas')) soma('integrar', 3);
    if (s.includes('retrabalho')) { soma('integrar', 2); soma('automacao', 2); }
    if (s.includes('demora')) soma('ia', 4);
    if (s.includes('visao')) soma('painel', 4);
    if (s.includes('manual')) soma('automacao', 4);
    if (s.includes('pessoas')) soma('processo', 3);
    if (s.includes('site')) soma('site', 4);
    if (areas.includes('atendimento') || areas.includes('vendas')) soma('ia', 2);
    if (areas.includes('gestao') || areas.includes('financeiro')) soma('painel', 2);
    if (areas.includes('operacao') || areas.includes('estoque')) { soma('automacao', 1); soma('processo', 1); }
    if (areas.includes('marketing')) soma('site', 2);
    if (sol.includes('ia')) soma('ia', 2);
    if (sol.includes('automacao')) soma('automacao', 2);
    if (sol.includes('dashboard')) soma('painel', 2);
    if (sol.includes('sistema')) soma('integrar', 2);
    if (sol.includes('site')) soma('site', 2);
    if (ia === 0) soma('comecar', 1.5);
    let recs = Object.entries(pontos).sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 3);
    if (recs.length < 3) ['integrar', 'ia', 'automacao'].forEach((k) => recs.length < 3 && !recs.includes(k) && recs.push(k));

    const grande = tam === '51-200' || tam === '200+';
    const plano = sol.includes('sistema') || (grande && sol.length > 1) ? ['Enterprise', 'uma solução própria, integrada e preparada para crescer']
      : sol.length === 1 && sol[0] === 'site' ? ['Start', 'presença digital para começar a gerar oportunidades']
      : ['Business', 'automações, integrações e IA para vender melhor com menos trabalho manual'];
    return { nota, fase, recs, plano, s, f, sol, areas, ia, tam };
  }

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function concluir() {
    const r = calcula();
    const nome = valor('nome').split(' ')[0];
    const dados = {
      enviadoEm: new Date().toISOString(), nome: valor('nome'), empresa: valor('empresa'), whatsapp: valor('whatsapp'), email: valor('email'),
      desafio: valor('desafio'), areas: r.areas.join(', '), situacoes: r.s.join(', '), ferramentas: r.f.join(', '), ia: r.ia,
      solucao: r.sol.join(', '), tamanho: r.tam, nota: r.nota, fase: r.fase[0], recomendacoes: r.recs.map((k) => RECS[k][0]).join(' | '), plano: r.plano[0],
      pagina: location.href, cargo: valor('cargo'), cidade: valor('cidade'),
    };
    const zap = valor('whatsapp').replace(/\D/g, '');
    const email = {
      _subject: `Novo diagnóstico no site: ${valor('empresa')} (${r.fase[0]})`, _template: 'table', _captcha: 'false',
      Nome: valor('nome'), Cargo: valor('cargo') || '-', Empresa: valor('empresa'), Cidade: valor('cidade') || '-',
      email: valor('email'), Telefone: valor('whatsapp'), 'Abrir WhatsApp': `https://wa.me/55${zap.replace(/^55/, '')}`,
      'Tamanho da empresa': rotulos('tamanho'), 'Áreas que quer melhorar': rotulos('areas'), 'Situações que acontecem': rotulos('situacoes'),
      'Ferramentas que usa': rotulos('ferramentas'), 'Uso de IA hoje': rotulos('ia'), 'Tipo de solução que interessa': rotulos('solucao'),
      'Maior desafio': valor('desafio') || '-', Nota: `${r.nota}/100 (${r.fase[0]})`, 'Melhorias indicadas': r.recs.map((k) => RECS[k][0]).join('; '),
      'Plano sugerido': r.plano[0], Enviado: new Date().toLocaleString('pt-BR'),
    };
    fetch(`https://formsubmit.co/ajax/${AVISAR}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(email) }).catch(() => {});
    if (ENDPOINT) {
      fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(dados) }).catch(() => {});
    }
    const texto = `Olá! Sou ${valor('nome')}, da ${valor('empresa')}. Fiz o diagnóstico no site da ALTIVE (resultado: ${r.fase[0]}). Gostaria de conversar sobre: ${r.recs.map((k) => RECS[k][0]).join('; ')}.${valor('desafio') ? ` Nosso maior desafio: ${valor('desafio')}` : ''}`;
    resultado.innerHTML = `
      <div class="dg-topo">
        <div class="dg-nota" style="--p:${r.nota}"><strong>${r.nota}<small>DE 100</small></strong></div>
        <div><p class="kicker">Diagnóstico da ${esc(valor('empresa'))}</p><h2>${esc(r.fase[0])}</h2><p>${esc(nome)}, ${esc(r.fase[1].charAt(0).toLowerCase() + r.fase[1].slice(1))}</p></div>
      </div>
      <p class="eyebrow">AS 3 MELHORIAS MAIS INDICADAS</p>
      <ol class="dg-recs">${r.recs.map((k) => `<li><h3>${esc(RECS[k][0])}</h3><p>${esc(RECS[k][1])}</p></li>`).join('')}</ol>
      <div class="dg-plano"><p>Ponto de partida sugerido: <b>plano ${r.plano[0]}</b>, ${esc(r.plano[1])}.</p>
        <a class="button button-primary" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}" target="_blank" rel="noopener">Conversar sobre o diagnóstico <i class="arr" aria-hidden="true"></i></a></div>
      <p class="dg-obs">Este é um diagnóstico automático, feito a partir das suas respostas. Recebemos suas respostas e a ALTIVE pode preparar uma análise mais completa, sem compromisso.</p>`;
    form.hidden = true; passo.hidden = true; barra.style.width = '100%';
    resultado.hidden = false; resultado.focus();
    window.scrollTo({ top: resultado.getBoundingClientRect().top + scrollY - 140, behavior: 'smooth' });
  }

  mostrar(0);
})();
