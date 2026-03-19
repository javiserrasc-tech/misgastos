import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'

const SHEET_TAB = 'FullBD'

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

function rowToGasto(row) {
  return {
    id:         row[0] || '',
    concepto:   row[1] || '',
    valor:      row[2] || '',
    comentario: row[3] || '',
    mes:        row[4] || '',
    anio:       row[5] || '',
  }
}

export default async function handler(req, res) {
  try {
    const sheets = await getSheets()
    const sheetId = process.env.GOOGLE_SHEET_ID

    // ── GET: últimas 5 inserciones ──────────────────────────────────────────
    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SHEET_TAB}!A:F`,
      })

      const rows = response.data.values || []
      // row 0 es la cabecera; cogemos las últimas 5 filas de datos
      const dataRows = rows.slice(1).filter(r => r[0]) // solo filas con ID
      const last5 = dataRows.slice(-5).reverse().map(rowToGasto)

      return res.status(200).json(last5)
    }

    // ── POST: insertar nuevo gasto ──────────────────────────────────────────
    if (req.method === 'POST') {
      const { concepto, valor, comentario, mes, anio } = req.body

      if (!concepto || !valor || !mes || !anio) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' })
      }

      const id = uuidv4().replace(/-/g, '').slice(0, 8)
      const valorNumerico = parseFloat(String(valor).replace(',', '.')) || 0

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${SHEET_TAB}!A:F`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [[id, concepto, valorNumerico, comentario || '', mes, Number(anio)]],
        },
      })

      return res.status(200).json({ success: true, id })
    }

    // ── PUT: actualizar gasto existente por UUID ────────────────────────────
    if (req.method === 'PUT') {
      const { id, concepto, valor, comentario, mes, anio } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Falta el ID' })
      }

      // Buscar la fila con este ID en columna A
      const colA = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SHEET_TAB}!A:A`,
      })

      const ids = colA.data.values || []
      const rowIndex = ids.findIndex(r => r[0] === id)

      if (rowIndex === -1) {
        return res.status(404).json({ error: `No se encontró la fila con ID: ${id}` })
      }

      const sheetRow = rowIndex + 1
      const valorNumerico = parseFloat(String(valor).replace(',', '.')) || 0

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${SHEET_TAB}!A${sheetRow}:F${sheetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[id, concepto, valorNumerico, comentario || '', mes, Number(anio)]],
        },
      })

      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Error in /api/gastos:', error)
    return res.status(500).json({ error: error.message })
  }
}
