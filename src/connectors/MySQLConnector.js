'use strict';
const mysql = require('mysql');

let client;

class MysqlDBConnector {
    static getConnection(host, port, user, password, database, ssl) {
        return new Promise((resolve, reject) => {
            try {
                if(client){
                    resolve(client);
                }else{
                    let mysqlConfig = {
                        host: host,
                        user: user,
                        port: port,
                        password: password,
                        database: database
                    };
                    if (ssl) {
                        mysqlConfig.ssl = ssl;
                    }
                    client = mysql.createConnection(mysqlConfig);
                    resolve(client);
                }
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });

    }
}

module.exports = MysqlDBConnector;
