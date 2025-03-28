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

// Busca os jogos do backend e exibe na tela
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

// Exibe os jogos formatados no DOM
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

// Copia os textos exibidos para a área de transferência
function copiarTexto() {
  const resultado = document.getElementById('resultado');
  const texto = resultado.innerText;

  if (!texto) {
    alert("Nenhum conteúdo para copiar.");
    return;
  }

  navigator.clipboard.writeText(texto)
    .then(() => alert("Texto copiado para a área de transferência!"))
    .catch(() => alert("Erro ao copiar texto."));
}

// Imprime a página do Agenda GE com a data selecionada
function imprimirAgendaGE() {
  const data = document.getElementById('dataInput').value;

  if (!data) {
    alert("Selecione uma data antes de imprimir.");
    return;
  }

  const [ano, mes, dia] = data.split("-");
  const dataFormatada = `${dia}-${mes}-${ano}`;

  const url = `https://ge.globo.com/agenda/#/futebol/${dataFormatada}`;
  const novaJanela = window.open(url, '_blank');

  novaJanela.onload = function () {
    setTimeout(() => {
      novaJanela.print();
    }, 2000); // tempo para carregar corretamente
  };
}
