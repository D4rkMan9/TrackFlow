# TrackFlow - Setup Guide

## Backend (Flask)

1. Copiar el archivo de ejemplo y completar los valores:
```bash
cp backend-flask/.env.example backend-flask/.env
```

2. Crear la base de datos y cargar los datos de prueba:
```bash
mysql -u root -p < backend-flask/schema.sql
mysql -u root -p trackflow < backend-flask/trackflow_seed.sql
```

3. Instalar dependencias y levantar el servidor:
```bash
cd backend-flask
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

## Frontend (Next.js)

1. Copiar el archivo de ejemplo:
```bash
cp frontend-react/.env.example frontend-react/.env.local
```

2. Instalar dependencias y levantar el servidor:
```bash
cd frontend-react
npm install
npx next dev
```

## Usuarios de prueba

| Email | Password |
|-------|----------|
| juan@example.com | password123 |
| admin@trackflow.com | password123 |
| maria@example.com | password123 |
