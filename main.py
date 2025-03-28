import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from datetime import datetime
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint para obter os jogos via GraphQL do GE
GRAPHQL_URL = "https://geql.globo.com/graphql"

@app.get("/jogos/{data}")
def coletar_jogos(data: str):
    try:
        # Data no formato DD-MM-YYYY; converte para YYYY-MM-DD para a query
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

        res = requests.post(GRAPHQL_URL, headers=headers, json=query)
        res.raise_for_status()
        data_response = res.json()

        # Acessa os eventos – se a estrutura não for a esperada, retorna erro
        if "data" not in data_response or "sports" not in data_response["data"]:
            return {"erro": "Estrutura dos dados inesperada ou chave 'sports' não encontrada"}

        eventos = data_response["data"]["sports"][0]["events"]["items"]
        resultados = {}

        for evento in eventos:
            campeonato = evento["championship"]["name"]
            mandante = evento["homeTeam"]["name"]
            visitante = evento["awayTeam"]["name"]
            hora_raw = evento["startTime"]

            hora = datetime.fromisoformat(hora_raw).strftime("%H:%M")
            data_exibicao = datetime.fromisoformat(hora_raw).strftime("%d/%m/%Y")
            linha = f"{data_exibicao} - {hora} - {mandante} x {visitante}"

            if campeonato not in resultados:
                resultados[campeonato] = []
            resultados[campeonato].append(linha)

        # Ordena os jogos de cada campeonato
        for jogos in resultados.values():
            jogos.sort()

        return resultados

    except Exception as e:
        return {"erro": f"Erro ao coletar jogos: {str(e)}"}

# Endpoint para gerar PDF da página do GE (agenda) usando html2pdf.app
@app.post("/gerar-pdf/{data}")
def gerar_pdf(data: str):
    try:
        # Formato esperado no parâmetro: DD-MM-YYYY
        dia, mes, ano = data.split("-")
        # Para o iframe do GE, a data é no mesmo formato: DD-MM-YYYY
        url_agenda = f"https://ge.globo.com/agenda/#/futebol/{dia}-{mes}-{ano}"

        # API para conversão (html2pdf.app)
        api_url = "https://api.html2pdf.app/v1/generate"
        params = {
            "url": url_agenda,
        }
        # Se você possuir uma chave de API, defina em HTML2PDF_API_KEY
        api_key = os.environ.get("HTML2PDF_API_KEY")
        if api_key:
            params["apiKey"] = api_key

        # Chama a API para converter a página em PDF
        r = requests.get(api_url, params=params)
        r.raise_for_status()

        return Response(content=r.content, media_type="application/pdf")
    except Exception as e:
        return {"erro": f"Erro ao gerar PDF: {str(e)}"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
