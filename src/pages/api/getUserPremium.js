// pages/api/getUserPremium.js
import sql from 'mssql';
import { parse } from 'cookie';

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
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const userId = parseInt(cookies.auth_token, 10);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await sql.connect(config);

    const result = await sql.query`
      SELECT policy, pool, benefit
      FROM Users
      WHERE id = ${userId}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await sql.close();
  }
}
