
# Agenda GE - Web App

Este projeto coleta jogos do site agenda.ge.globo.com e exibe por campeonato, com opção de impressão.

## ✅ Tecnologias

- Backend: FastAPI + requests + BeautifulSoup
- Frontend: HTML + JavaScript
- Hospedagem: Render (backend) + Netlify (frontend)

## 🚀 Como rodar localmente

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Acesse: http://localhost:8000/jogos/28-03-2025

## 🌐 Como hospedar

### Backend (Render)

- Crie um serviço web em https://render.com
- Conecte com este repositório do GitHub
- Use:
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`

### Frontend (Netlify)

- Vá para https://netlify.com
- Faça upload de `index.html` e `script.js`
- Pronto!

