
# Agenda GE - Jogos do Dia

Este projeto coleta os jogos do site agenda.ge.globo.com por data e exibe de forma organizada.

## 📦 Backend (FastAPI + Playwright)

### Como rodar localmente
1. Instale as dependências:
```
pip install -r requirements.txt
playwright install
```

2. Rode o servidor:
```
uvicorn main:app --reload
```

## 🌐 Frontend

Abra o `index.html` no navegador ou hospede em serviços como Netlify ou Vercel.

---

## 🚀 Hospedagem Gratuita

### Backend (Render.com)

1. Crie conta no https://render.com
2. Crie um novo "Web Service"
3. Escolha "Deploy from GitHub" e conecte este repositório
4. Configure:
   - **Build Command:** `pip install -r requirements.txt && playwright install`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
   - **Porta:** `10000`
   - **Plano:** Free

### Frontend (Netlify)

1. Crie conta no https://netlify.com
2. Faça upload de `index.html` e `script.js`
3. Após o deploy, seu site estará disponível online

