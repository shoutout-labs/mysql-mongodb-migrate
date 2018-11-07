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

    getRecords(filterExp, offset, limit) {
        let ctx = this;
        return new Promise(async (resolve, reject) => {
            try {
                let mysqlConnection = await MySQLConnector.getConnection(ctx.host, ctx.port, ctx.user, ctx.password, ctx.database, ctx.ssl);
                ctx.docClient.scan(params, function (error, response) {
                    if (error) {
                        console.error(error);
                        reject(error);
                    } else {
                        resolve(response);
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