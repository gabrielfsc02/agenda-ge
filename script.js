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
async function carregarJogos() {
  const dataInput = document.getElementById('dataInput').value;
  if (!dataInput) {
    alert("Escolha uma data!");
    return;
  }

  const partes = dataInput.split('-'); // yyyy-mm-dd
  const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;

  const res = await fetch(`https://agenda-ge-backend.onrender.com/jogos/${dataFormatada}`);
  const dados = await res.json();

  const div = document.getElementById("resultados");
  div.innerHTML = '';

  if (!dados || dados.erro) {
    div.innerHTML = `<p style="color:red;">${dados.erro || 'Erro ao buscar dados.'}</p>`;
    return;
  }

  Object.keys(dados).forEach(campeonato => {
    const h2 = document.createElement('h2');
    h2.innerText = campeonato;
    div.appendChild(h2);

    dados[campeonato].forEach(jogo => {
      const p = document.createElement('p');
      p.innerText = jogo;
      div.appendChild(p);
    });
  });
}

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

function copiarTexto() {
  const resultados = document.getElementById('resultados');
  const texto = resultados.innerText;

  navigator.clipboard.writeText(texto)
    .then(() => alert("Texto copiado para a área de transferência!"))
    .catch(() => alert("Erro ao copiar texto."));
}

function imprimirAgendaGE() {
  const data = document.getElementById('dataInput').value;

  if (!data) {
    alert("Selecione uma data antes de imprimir.");
    return;
  }

  const [ano, mes, dia] = data.split("-");
  const dataFormatada = `${dia}-${mes}-${ano}`;

  // Abre nova aba com a agenda GE já na data correta
  const url = `https://ge.globo.com/agenda/#/futebol/${dataFormatada}`;
  const novaJanela = window.open(url, '_blank');

  novaJanela.onload = function () {
    setTimeout(() => {
      novaJanela.print();
    }, 2000); // tempo para carregar e exibir corretamente
  };
}
