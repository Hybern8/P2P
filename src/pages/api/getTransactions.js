import { ConnectionPool } from 'mssql';

const config = {
  user: 'hyber',
  password: '335555',
  server: 'localhost\\SQLEXPRESS',
  database: 'p2p',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const pool = await new ConnectionPool(config).connect();
    const result = await pool.request()
      .input('userId', userId)
      .query('SELECT * FROM Transactions WHERE userId = @userId ORDER BY date DESC');
    
    pool.close();

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}
