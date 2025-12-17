const { mySqlQury } = require('../middleware/db')
const axios = require('axios');


const DataUpdate = async (table, setClause, whereClause, hostname, protocol) => {
    try {
        const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        const result = await mySqlQury(query);

        if (result.affectedRows === 0) {
            console.log(`[${protocol}://${hostname}] No rows updated for query: ${query}`);
            return -1;
        }

        return 1; // success
    } catch (error) {
        console.log(`[${protocol}://${hostname}] Error in DataUpdate:`, error);
        return -1;
    }
}

const DataDelete = async (table, whereClause, hostname, protocol) => {
    try {
        const query = `DELETE FROM ${table} WHERE ${whereClause}`;
        const result = await mySqlQury(query);

        if (result.affectedRows === 0) {
            console.warn(`[${protocol}://${hostname}] No rows deleted for query: ${query}`);
            return -1;
        }

        return 1; // success
    } catch (error) {
        console.log(`[${protocol}://${hostname}] Error in DataDelete:`, error);
        return -1;
    }
}

const DataFind = async (query) => {
    try {
        const result = await mySqlQury(query);
        return result;
    } catch (error) {
        console.log("Error in DataFind:", error);
        return -1;
    }
}

const DataInsert = async (table, columns, values, hostname, protocol) => {
    try {
        const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
        const result = await mySqlQury(query);

        if (!result.insertId) {
            console.log(`[${protocol}://${hostname}] Insert failed for query: ${query}`);
            return -1;
        }

        return result; // Return inserted record ID
    } catch (error) {
        console.log(`[${protocol}://${hostname}] Error in DataInsert:`, error);
        return -1;
    }
}

module.exports = { DataFind, DataInsert, DataUpdate, DataDelete }