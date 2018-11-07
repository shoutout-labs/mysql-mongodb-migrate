'use strict';
const MySQLConnector = require('../connectors/MySQLConnector');

class MySQLDAO {
    constructor(table, database, host, port, user, password, ssl) {
        this.table = table;
        this.database = database;
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.ssl = ssl;
    }

    getRecords(whereExp, offset, limit) {
        let ctx = this;
        return new Promise(async (resolve, reject) => {
            try {
                let mysqlConnection = await MySQLConnector.getConnection(ctx.host, ctx.port, ctx.user, ctx.password, ctx.database, ctx.ssl);

                let queryString = "SELECT * FROM " + ctx.table;
                if (whereExp) {
                    queryString += " WHERE " + whereExp;
                }
                queryString += " LIMIT ? OFFSET ?";
                console.log(ctx.table);
                let queryData = [limit, offset];

                mysqlConnection.query(queryString, queryData, function (err, results) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            } catch (error) {
                console.error(error);
                reject(reject);
            }
        });
    }
}

module.exports = MySQLDAO;