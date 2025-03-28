async function carregarJogos() {
  const dataInput = document.getElementById('data').value;
  if (!dataInput) {
    alert("Escolha uma data!");
    return;
  }

  // dataInput vem no formato yyyy-mm-dd; precisamos converter para dd-mm-yyyy
  const partes = dataInput.split('-'); // [yyyy, mm, dd]
  const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;

  // URL do backend (substitua se necessário)
  const res = await fetch(`https://agenda-ge-backend.onrender.com/jogos/${dataFormatada}`);
  const dados = await res.json();

  const div = document.getElementById("resultados");
  div.innerHTML = '';

  if (dados.erro) {
    div.innerHTML = `<p style="color: red;">${dados.erro}</p>`;
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
