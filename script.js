// Atualiza o iframe com a data selecionada
function atualizarIframe() {
  const data = document.getElementById('dataInput').value;
  const iframe = document.getElementById('geAgendaIframe');
  
  if (data) {
    const [ano, mes, dia] = data.split('-');
    const dataFormatada = `${dia}-${mes}-${ano}`;
    iframe.src = `https://ge.globo.com/agenda/#/futebol/${dataFormatada}`;
  } else {
    iframe.src = 'https://ge.globo.com/agenda/#/futebol/';
  }
}

// Função para buscar os jogos do backend
async function carregarJogos() {
  const data = document.getElementById('dataInput').value;
  const resultado = document.getElementById('resultado');
  
  if (!data) {
    resultado.innerHTML = `<div class="error">Selecione uma data válida</div>`;
    return;
  }

  const [ano, mes, dia] = data.split('-');
  const dataFormatada = `${dia}-${mes}-${ano}`;

  resultado.innerHTML = `<div class="loading">Carregando jogos...</div>`;
  
  try {
    const resposta = await fetch(`https://agenda-ge-backend.onrender.com/jogos/${dataFormatada}`);
    const jogos = await resposta.json();
    
    if (jogos.erro) {
      resultado.innerHTML = `<div class="error">${jogos.erro}</div>`;
      document.getElementById('copyButton').style.display = 'none';
      return;
    }
    
    exibirJogos(jogos);
    document.getElementById('copyButton').style.display = 'block';
  } catch (erro) {
    resultado.innerHTML = `<div class="error">Erro: ${erro.message}</div>`;
    document.getElementById('copyButton').style.display = 'none';
  }
}

function exibirJogos(jogos) {
  let html = '<div class="jogos-container">';
  for (const [campeonato, jogosList] of Object.entries(jogos)) {
    html += `
      <div class="campeonato">
        <div class="campeonato-header">${campeonato}</div>
    `;
    jogosList.forEach(jogo => {
      html += `
        <div class="jogo">
          <span class="jogo-formatado">${jogo}</span>
        </div>
      `;
    });
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('resultado').innerHTML = html;
}

// Função para copiar os resultados exibidos
function copiarTexto() {
  const texto = document.getElementById('resultado').innerText;
  if (!texto) {
    alert("Nenhum jogo encontrado para copiar!");
    return;
  }
  navigator.clipboard.writeText(texto)
    .then(() => {
      alert("Texto copiado para a área de transferência!");
    })
    .catch(err => {
      alert("Erro ao copiar texto: " + err);
    });
}

// Função para gerar PDF da página do GE usando o endpoint do backend
async function imprimirAgenda() {
  const data = document.getElementById('dataInput').value;
  if (!data) {
    alert("Selecione uma data!");
    return;
  }
  const [ano, mes, dia] = data.split('-');
  const dataFormatada = `${dia}-${mes}-${ano}`;
  
  try {
    // Chama o endpoint /gerar-pdf da sua API
    const response = await fetch(`https://agenda-ge-backend.onrender.com/gerar-pdf/${dataFormatada}`, {
      method: 'POST'
    });
    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.erro || 'Erro na geração do PDF');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda_ge_${dataFormatada}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (erro) {
    alert("Erro ao gerar PDF: " + erro.message);
  }
}
