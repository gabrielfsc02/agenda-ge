// Função para buscar os jogos do backend
async function carregarJogos(dataFormatada) {
  try {
    const response = await fetch(`https://agenda-ge-backend.onrender.com/jogos/${dataFormatada}`);
    const dados = await response.json();
    return dados;
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    return { erro: "Erro ao buscar jogos" };
  }
}

// Atualiza o src do iframe com a data selecionada
function atualizarIframe(dataFormatada) {
  const iframe = document.getElementById('iframeAgenda');
  // Atualiza a URL do iframe; a estrutura esperada é: https://ge.globo.com/agenda/#/futebol/{data}
  iframe.src = `https://ge.globo.com/agenda/#/futebol/${dataFormatada}`;
}

// Função principal acionada pelo botão "Buscar Jogos"
async function buscar() {
  const dataInput = document.getElementById('data').value;
  if (!dataInput) {
    alert("Escolha uma data!");
    return;
  }

  // Converte data de yyyy-mm-dd para dd-mm-yyyy
  const partes = dataInput.split('-'); // [yyyy, mm, dd]
  const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;

  // Atualiza o iframe com a nova data
  atualizarIframe(dataFormatada);

  // Busca os jogos via API
  const dados = await carregarJogos(dataFormatada);

  const div = document.getElementById("resultados");
  div.innerHTML = '';

  if (dados.erro) {
    div.innerHTML = `<p class="text-danger">${dados.erro}</p>`;
    return;
  }

  // Exibe os resultados por campeonato
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

// Função para copiar os jogos exibidos
function copiarJogos() {
  const jogosText = document.getElementById('resultados').innerText;
  if (!jogosText) {
    alert("Nenhum jogo encontrado para copiar!");
    return;
  }

  navigator.clipboard.writeText(jogosText).then(() => {
    const alertDiv = document.getElementById('copiedAlert');
    alertDiv.style.display = 'block';
    setTimeout(() => alertDiv.style.display = 'none', 3000);  // Oculta o alerta após 3 segundos
  }).catch(err => {
    console.error("Erro ao copiar:", err);
  });
}

// Função para imprimir a agenda GE no formato correto
function imprimirAgenda() {
  const iframe = document.getElementById('iframeAgenda');
  const iframeSrc = iframe.src;
  const printWindow = window.open(iframeSrc, '_blank', 'width=800,height=600');
  printWindow.print();
}
