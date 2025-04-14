// pages/api/getRate.js
import sql from 'mssql';

const config = {
  user: 'hyber',
  password: '335555',
  server: 'localhost\\SQLEXPRESS',
  database: 'p2p',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pool } = req.body;

  try {
    await sql.connect(config);

    const result = await sql.query`
      SELECT qx_loess
      FROM rate
      WHERE pool_range = ${pool}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Rate not found' });
    }

    return res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await sql.close();
  }
}
