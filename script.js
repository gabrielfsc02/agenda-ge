async function carregarJogos() {
  const dataInput = document.getElementById('data').value;
  if (!dataInput) {
    alert("Escolha uma data!");
    return;
  }

  const partes = dataInput.split('-');
  const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;

  const res = await fetch(`https://agenda-ge-backend.onrender.com/jogos/${dataFormatada}`);
  const dados = await res.json();

  const div = document.getElementById("resultados");
  div.innerHTML = '';

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
