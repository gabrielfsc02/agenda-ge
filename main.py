
import os
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from playwright.sync_api import sync_playwright
from datetime import datetime
import uvicorn

# Garante instalação dos navegadores no ambiente da Render
subprocess.run("playwright install --with-deps", shell=True)

app = FastAPI()

# Permitir chamadas do frontend (CORS)
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

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="load")
        page.wait_for_selector(".eventGrouperstyle__GroupByChampionshipsWrapper-sc-1bz1qr-0", timeout=15000)

        campeonatos = page.query_selector_all(".eventGrouperstyle__GroupByChampionshipsWrapper-sc-1bz1qr-0")
        resultados = {}

        for camp in campeonatos:
            nome = camp.query_selector(".eventGrouperstyle__ChampionshipName-sc-1bz1qr-2")
            nome_camp = nome.inner_text().strip() if nome else "Desconhecido"
            jogos_raw = camp.query_selector_all('[aria-label^="Confira o vídeo dos melhores momentos do jogo"]')
            jogos = []

            for jogo in jogos_raw:
                horario_tags = jogo.query_selector_all("span.sc-jXbUNg.zrfFX")
                if len(horario_tags) < 2:
                    continue
                hora = horario_tags[1].inner_text().strip()

                clubes = jogo.query_selector_all("span.sc-eeDRCY.kXIsjf")
                if len(clubes) < 2:
                    continue

                mandante = clubes[0].inner_text().strip()
                visitante = clubes[1].inner_text().strip()

                data_formatada = datetime.strptime(data, "%d-%m-%Y").strftime("%d/%m/%Y")
                jogos.append(f"{data_formatada} - {hora} - {mandante} x {visitante}")

            jogos.sort()
            if jogos:
                resultados[nome_camp] = jogos

        browser.close()
        return resultados

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
