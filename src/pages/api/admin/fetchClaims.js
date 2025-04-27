import sql from 'mssql';

const config = {
  user: 'hyber',
  password: '335555',
  server: 'localhost\\SQLEXPRESS',
  database: 'p2p',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export default async function handler(req, res) {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query('SELECT id, userID, cause_of_death, date_of_death, pool, pool_point, benefit, claimant FROM Claims');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Fetch Claims Error:', err);
    res.status(500).json({ error: 'Failed to fetch claims' });
  } finally {
    if (pool) await pool.close();
  }
}
