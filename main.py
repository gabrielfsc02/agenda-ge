import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

# Habilita CORS para permitir chamadas do frontend
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
        # Recebe data no formato DD-MM-YYYY e converte para YYYY-MM-DD
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
        response_json = res.json()
        
        # Para depuração, imprima a resposta (pode comentar depois)
        print("Response Data:", response_json)
        
        # A nova estrutura vem com a chave "championshipsAgenda"
        if "data" in response_json and "championshipsAgenda" in response_json["data"]:
            agendas = response_json["data"]["championshipsAgenda"]
        else:
            return {"erro": "Estrutura dos dados inesperada ou chave 'championshipsAgenda' não encontrada"}
        
        resultados = {}
        
        # Para cada agenda (cada campeonato) na resposta
        for agenda in agendas:
            campeonato = agenda.get("championship", {}).get("name", "Desconhecido")
            # Os eventos futuros estão na chave "future"
            eventos = agenda.get("future", [])
            for evento in eventos:
                match = evento.get("match", {})
                # Extraindo dados: data, hora, times
                start_date = match.get("startDate")
                start_hour = match.get("startHour")
                first_team = match.get("firstContestant", {}).get("popularName")
                second_team = match.get("secondContestant", {}).get("popularName")
                
                # Se faltar alguma informação, pula esse evento
                if not all([start_date, start_hour, first_team, second_team]):
                    continue
                
                try:
                    # Formata a data (assumindo formato YYYY-MM-DD)
                    data_exibicao = datetime.strptime(start_date, "%Y-%m-%d").strftime("%d/%m/%Y")
                    # Formata a hora (assumindo formato HH:MM:SS)
                    hora_exibicao = datetime.strptime(start_hour, "%H:%M:%S").strftime("%H:%M")
                except Exception:
                    data_exibicao = start_date
                    hora_exibicao = start_hour
                
                linha = f"{data_exibicao} - {hora_exibicao} - {first_team} x {second_team}"
                
                if campeonato not in resultados:
                    resultados[campeonato] = []
                resultados[campeonato].append(linha)
        
        # Ordena as linhas de cada campeonato
        for jogos in resultados.values():
            jogos.sort()
        
        return resultados

    except Exception as e:
        return {"erro": f"Erro ao coletar jogos: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
