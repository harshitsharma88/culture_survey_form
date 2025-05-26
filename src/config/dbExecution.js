const { getConnection, sql } = require('./dbConnection');

async function executeQuery(query) {
    try {
        const pool = await getConnection();
        const request = pool.request();
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('SQL Query Execution Error:', error);
        throw error;
    }
}

async function executeStoredProcedure(spName, params = [], recordsets = false) {
    try {
        const pool = await getConnection();
        const request = pool.request();

        params.forEach(({ name, value }) => {
            request.input(name, value);
        });

        const result = await request.execute(spName);
        return recordsets ? result.recordsets : result.recordset;
    } catch (error) {
        console.error('Stored Procedure Execution Error:', error);
        throw error;
    }
}

module.exports = { executeQuery, executeStoredProcedure };