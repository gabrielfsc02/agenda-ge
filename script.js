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
  // Agrupa os jogos por campeonato
  const agrupados = Object.keys(jogos).reduce((acc, campeonato) => {
    acc[campeonato] = jogos[campeonato];
    return acc;
  }, {});
  
  let html = '<div class="jogos-container">';
  for (const [campeonato, jogosList] of Object.entries(agrupados)) {
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

// Função para copiar os jogos exibidos
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

// Função para gerar PDF da área de resultados usando jsPDF
function imprimirAgenda() {
  const data = document.getElementById('dataInput').value;
  if (!data) {
    alert("Selecione uma data!");
    return;
  }
  const resultado = document.getElementById('resultado').innerText;
  if (!resultado) {
    alert("Nenhum jogo encontrado para gerar PDF!");
    return;
  }
  // Utilize jsPDF para gerar o PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Divida o texto para caber na página
  const lines = doc.splitTextToSize(resultado, 180);
  doc.text(lines, 10, 10);

  const [ano, mes, dia] = data.split('-');
  const dataFormatada = `${dia}-${mes}-${ano}`;
  doc.save(`agenda_ge_${dataFormatada}.pdf`);
}
