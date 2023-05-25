const env = process.env;
const { Pool } = require('pg');

const pool = new Pool({
	host: env.POSTGRES_HOST,
	user: env.POSTGRES_USERNAME,
	password: env.POSTGRES_PASSWORD,
	database: env.POSTGRES_DATABASE_NAME,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});

module.exports = pool;