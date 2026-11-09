/**
 * Recebe as respostas do Diagnóstico gratuito do site (altivetech.com.br/diagnostico.html),
 * grava numa planilha do Google e avisa por e-mail.
 *
 * Como publicar (uma vez só, logado na conta da ALTIVE):
 * 1. script.google.com > Novo projeto > cole este arquivo.
 * 2. Execute "configurar" e permita o acesso: cria a planilha "Diagnósticos ALTIVE".
 * 3. Implantar > Nova implantação > Tipo: App da Web > Executar como: Eu > Quem pode acessar: Qualquer pessoa.
 * 4. Copie a URL do app da Web e coloque em ENDPOINT, no arquivo java/diagnostico.js do site.
 */
const AVISAR = 'altivtech@gmail.com';
const COLUNAS = ['enviadoEm', 'nome', 'empresa', 'whatsapp', 'email', 'tamanho', 'areas', 'situacoes', 'ferramentas', 'ia', 'solucao', 'desafio', 'nota', 'fase', 'recomendacoes', 'plano', 'pagina'];

function configurar() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('PLANILHA')) {
    Logger.log('Planilha já existe: ' + SpreadsheetApp.openById(props.getProperty('PLANILHA')).getUrl());
    return;
  }
  const ss = SpreadsheetApp.create('Diagnósticos ALTIVE');
  const aba = ss.getSheets()[0];
  aba.setName('Respostas');
  aba.appendRow(COLUNAS);
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
  props.setProperty('PLANILHA', ss.getId());
  MailApp.getRemainingDailyQuota(); // pede a permissão de e-mail já na configuração
  Logger.log('Planilha criada: ' + ss.getUrl());
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const id = PropertiesService.getScriptProperties().getProperty('PLANILHA');
    const aba = SpreadsheetApp.openById(id).getSheetByName('Respostas');
    aba.appendRow(COLUNAS.map((c) => (d[c] === undefined ? '' : String(d[c]).slice(0, 2000))));
    const zap = String(d.whatsapp || '').replace(/\D/g, '');
    MailApp.sendEmail({
      to: AVISAR,
      subject: `Novo diagnóstico: ${d.empresa || 'sem empresa'} (${d.fase || ''})`,
      htmlBody:
        `<p><b>${esc(d.nome)}</b>, da <b>${esc(d.empresa)}</b>, fez o diagnóstico no site.</p>` +
        `<p>WhatsApp: <a href="https://wa.me/55${zap.replace(/^55/, '')}">${esc(d.whatsapp)}</a><br>E-mail: ${esc(d.email || '-')}<br>Tamanho: ${esc(d.tamanho)}</p>` +
        `<p><b>Quer melhorar:</b> ${esc(d.areas)}<br><b>Situações:</b> ${esc(d.situacoes)}<br><b>Ferramentas:</b> ${esc(d.ferramentas)}<br><b>Interesse:</b> ${esc(d.solucao)}</p>` +
        `<p><b>Maior desafio:</b> ${esc(d.desafio || '-')}</p>` +
        `<p><b>Resultado:</b> ${esc(d.nota)}/100, ${esc(d.fase)}. Plano sugerido: ${esc(d.plano)}.<br><b>Recomendações:</b> ${esc(d.recomendacoes)}</p>`,
    });
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('erro: ' + err);
  }
}

function esc(t) {
  return String(t === undefined ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
