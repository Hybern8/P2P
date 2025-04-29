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

    const result = await pool.request().query(`
      SELECT 
        id,
        email,
        pool,
        pool_point,
        noClaimRefund,
        endDate
      FROM Users
      WHERE noClaimRefund > 0
        AND endDate IS NOT NULL
        AND endDate <= GETDATE()
    `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Fetch Refunds Error:', err);
    res.status(500).json({ error: 'Failed to fetch refunds' });
  } finally {
    if (pool) await pool.close();
  }
}
