import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GRAPHQL_URL = "https://geql.globo.com/graphql"

@app.get("/jogos/{data}")
def coletar_jogos(data: str):
    try:
        dia, mes, ano = data.split("-")
        data_formatada = f"{ano}-{mes}-{dia}"
        
        headers = {
            "accept": "*/*",
            "accept-language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/json",
            "origin": "https://ge.globo.com",
            "referer": "https://ge.globo.com/",
            "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        }
        
        params = {
            "variables": f'{{"date":"{data_formatada}"}}',
            "extensions": '{"persistedQuery":{"version":1,"sha256Hash":"c1b3f92ec73ae582e54ed74125a92b9fa8310083ca25d37fa89801d8833e8e8c"}}'
        }
        
        res = requests.get(GRAPHQL_URL, headers=headers, params=params)
        res.raise_for_status()
        data = res.json()

        eventos = data["data"]["sports"][0]["events"]["items"]
        resultados = {}

        for evento in eventos:
            campeonato = evento["championship"]["name"]
            mandante = evento["homeTeam"]["name"]
            visitante = evento["awayTeam"]["name"]
            hora_raw = evento["startTime"]

            hora = datetime.fromisoformat(hora_raw).strftime("%H:%M")
            data_formatada_exibicao = datetime.fromisoformat(hora_raw).strftime("%d/%m/%Y")
            linha = f"{data_formatada_exibicao} - {hora} - {mandante} x {visitante}"

            if campeonato not in resultados:
                resultados[campeonato] = []
            resultados[campeonato].append(linha)

        for jogos in resultados.values():
            jogos.sort()

        return resultados

    except Exception as e:
        return {"erro": f"Erro ao coletar jogos: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
