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

  const { userId, policy } = req.body;

  if (!userId || !policy) return res.status(400).json({ error: 'Missing userId or policy' });

  try {
    const pool = await new ConnectionPool(config).connect();
    await pool.request()
      .input('userId', userId)
      .input('policy', policy)
      .query('UPDATE Users SET policy = @policy WHERE id = @userId');
    pool.close();

    res.status(200).json({ message: 'Policy updated successfully' });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
}
