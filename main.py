
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

GRAPHQL_URL = "https://ge.globo.com/graphql"

@app.get("/jogos/{data}")
def coletar_jogos(data: str):
    try:
        dia, mes, ano = data.split("-")
        data_formatada = f"{ano}-{mes}-{dia}"
        query = {
            "operationName": "AgendaFutebol",
            "variables": {
                "sport": "futebol",
                "date": data_formatada
            },
            "query": '''
                query AgendaFutebol($sport: String!, $date: String!) {
                  sports(sport: $sport) {
                    events(date: $date) {
                      items {
                        startTime
                        homeTeam {
                          name
                        }
                        awayTeam {
                          name
                        }
                        championship {
                          name
                        }
                      }
                    }
                  }
                }
            '''
        }

        res = requests.post(GRAPHQL_URL, json=query)
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
