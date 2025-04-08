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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { userId, amount } = req.body;

  if (!userId || !amount) return res.status(400).json({ error: 'Missing userId or amount' });

  try {
    const pool = await new ConnectionPool(config).connect();

    await pool.request()
      .input('userId', userId)
      .input('amount', amount)
      .input('date', new Date())
      .query('INSERT INTO Transactions (userId, amount, date) VALUES (@userId, @amount, @date)');

    await pool.request()
      .input('userId', userId)
      .input('amount', amount)
      .query('UPDATE Users SET contributions = ISNULL(contributions, 0) + @amount WHERE id = @userId');

    pool.close();

    res.status(200).json({ message: 'Contribution added successfully' });
  } catch (error) {
    console.error('Error adding contribution:', error);
    res.status(500).json({ error: 'Failed to add contribution' });
  }
}
