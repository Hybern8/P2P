import sql from 'mssql';
import { parse } from 'cookie';

const config = {
  user: 'hyber',
  password: '335555',
  server: 'localhost\\SQLEXPRESS',
  database: 'p2p',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export default async function handler(req, res) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const userId = parseInt(cookies.auth_token, 10);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT policy FROM Users WHERE id = @userId');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const policy = result.recordset[0].policy;
    return res.status(200).json({ policy });

  } catch (err) {
    console.error('Error retrieving policy:', err);
    return res.status(500).json({ error: 'Failed to fetch policy' });
  }
}
