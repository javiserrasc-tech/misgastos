import { google } from 'googleapis'

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sheets = await getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Conceptos!A2:B200',
    })

    const rows = response.data.values || []
    const conceptos = rows
      .map(row => ({ id: row[0] || '', nombre: row[1] || '' }))
      .filter(c => c.nombre.trim() !== '')
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    return res.status(200).json(conceptos)
  } catch (error) {
    console.error('Error fetching conceptos:', error)
    return res.status(500).json({ error: error.message })
  }
}
