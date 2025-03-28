
import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from bs4 import BeautifulSoup

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/jogos/{data}")
def coletar_jogos(data: str):
    url = f"https://ge.globo.com/agenda/#/futebol/{data}"
    response = requests.get(url)

    if response.status_code != 200:
        return {"erro": "Não foi possível acessar a agenda"}

    soup = BeautifulSoup(response.text, "html.parser")
    scripts = soup.find_all("script")

    json_data = None
    for script in scripts:
        if "__APOLLO_STATE__" in script.text:
            start = script.text.find("{")
            try:
                json_data = script.text[start:]
                break
            except Exception:
                continue

    if not json_data:
        return {"erro": "Dados da agenda não encontrados"}

    import json
    try:
        # limpa o conteúdo para parsear corretamente
        json_data = json.loads(json_data)
    except Exception:
        return {"erro": "Erro ao processar os dados"}

    eventos = [v for k, v in json_data.items() if k.startswith("Event:")]

    resultados = {}
    for evento in eventos:
        campeonato = evento.get("championship", {}).get("name", "Desconhecido")
        mandante = evento.get("homeTeam", {}).get("name")
        visitante = evento.get("awayTeam", {}).get("name")
        hora = evento.get("startTime")
        if not all([mandante, visitante, hora]):
            continue

        hora_formatada = datetime.fromisoformat(hora).strftime("%H:%M")
        data_formatada = datetime.strptime(data, "%d-%m-%Y").strftime("%d/%m/%Y")
        linha = f"{data_formatada} - {hora_formatada} - {mandante} x {visitante}"

        if campeonato not in resultados:
            resultados[campeonato] = []
        resultados[campeonato].append(linha)

    for jogos in resultados.values():
        jogos.sort()

    return resultados

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
