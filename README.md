# Mis Gastos — Instalación

---

## PASO 1 — Google Sheet

1. Abrir el Google Sheet
2. Añadir una nueva pestaña (botón **+** abajo) y nombrarla exactamente: `Conceptos`
3. Celda **A1**: `ID` — Celda **B1**: `Nombre`
4. Rellenar a partir de la fila 2 con los conceptos deseados
5. Confirmar que la pestaña de gastos se llama exactamente `FullBD`

---

## PASO 2 — Google Cloud: Service Account

1. Ir a https://console.cloud.google.com
2. Crear un proyecto si no existe
3. **APIs & Services → Library** → buscar `Google Sheets API` → **Enable**
4. **APIs & Services → Credentials → + Create Credentials → Service account**
5. Asignar un nombre → **Create and continue → Done**
6. Clic en la cuenta creada → **Keys → Add Key → Create new key → JSON → Create**
7. Guardar el archivo `.json` descargado

### Dar acceso al Sheet

1. Abrir el `.json` con un editor de texto y copiar el valor de `client_email`
2. En el Google Sheet → **Compartir** → pegar el email → rol **Editor** → **Enviar**

---

## PASO 3 — GitHub

1. Crear repositorio nuevo → **Private**
2. Subir todos los archivos respetando esta estructura:

```
├── pages/
│   ├── _app.js
│   ├── index.js
│   └── api/
│       ├── gastos.js
│       └── conceptos.js
├── styles/
│   └── globals.css
├── public/
│   └── manifest.json
├── .gitignore
├── .env.example
├── next.config.js
└── package.json
```

---

## PASO 4 — Vercel

1. Ir a https://vercel.com → **Add New → Project** → importar el repositorio → **Deploy**
2. Ir a **Settings → Environment Variables** y añadir:

| Name | Value |
|------|-------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email de la Service Account |
| `GOOGLE_PRIVATE_KEY` | Clave privada de la Service Account |
| `GOOGLE_SHEET_ID` | ID del Google Sheet |
| `APP_PASSWORD` | Contraseña para entrar a la app (la que quieras) |
| `SESSION_SECRET` | Texto largo aleatorio, cualquiera (ej: `xK9p2mQ8vL3nR7`) |

3. **Deployments → Redeploy**

---

## PASO 5 — Instalar en móvil

**iPhone (Safari):** Compartir → "Añadir a pantalla de inicio"

**Android (Chrome):** Menú → "Añadir a pantalla de inicio"

---

## Errores frecuentes

| Error | Causa |
|-------|-------|
| Conceptos vacíos | La pestaña no se llama exactamente `Conceptos` |
| Error al guardar | `GOOGLE_PRIVATE_KEY` mal copiada |
| No escribe en el Sheet | Sheet no compartido con la Service Account como Editor |
| Pestaña incorrecta | La pestaña de gastos no se llama exactamente `FullBD` |
