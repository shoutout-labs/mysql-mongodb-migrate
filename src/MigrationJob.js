'use strict';
const lodash = require('lodash');
const RateLimiter = require('limiter').RateLimiter;
const MySQLDAO = require('./dao/MySQLDAO');
const MongoDBDAO = require('./dao/MongoDBDAO');


class MigrationJob {
    constructor(sourceDbName, sourceTableName, targetDbName, targetTableName, sourceConnectionOptions, targetConnectionOptions, sourceReadLimit, sourceReadThroughput) {
        this.mapperFunction = (item) => { return item; };
        this.filterFunction = () => { return true; };
        this.mysqlDAO = new MySQLDAO(sourceTableName, sourceDbName, sourceConnectionOptions.host, sourceConnectionOptions.port, sourceConnectionOptions.user, sourceConnectionOptions.password, sourceConnectionOptions.ssl);
        this.mongoDBDAO = new MongoDBDAO(targetTableName, targetDbName, targetConnectionOptions.host, targetConnectionOptions.user, targetConnectionOptions.password);
        this.sourceReadLimit = sourceReadLimit || 100;
        this.filterExpression = null;
        this.sourceReadThroughput = sourceReadThroughput ? Number(sourceReadThroughput) : 1000;
        this.limiter = new RateLimiter(this.sourceReadThroughput, 1000);
        this._removeTokens = (tokenCount) => {
            return new Promise((resolve, reject) => {
                this.limiter.removeTokens(tokenCount, () => {
                    resolve();
                });
            });
        }
    }

    setMapperFunction(mapperFunction) {
        this.mapperFunction = mapperFunction
    }

    setFilterFunction(filterFunction) {
        this.filterFunction = filterFunction;
    }

    setSourcefilterExpression(filterExpression) {
        this.filterExpression = filterExpression;
    }

    run() {
        let ctx = this;
        return new Promise(async (resolve, reject) => {
            try {
                let readOffset = 0, startTime, endTime, totalItemCount = 0, iteration = 1, permitsToConsume = ctx.sourceReadThroughput;
                do {
                    startTime = new Date().getTime();
                    await ctx._removeTokens(permitsToConsume);
                    let sourceItems = await ctx.mysqlDAO.getRecords(ctx.filterExpression, readOffset, ctx.sourceReadLimit);
                    totalItemCount += sourceItems.length;
                    console.log('Received ', sourceItems.length, ' items at iteration ', iteration, ' and total of ', totalItemCount, ' items received');
                    let targetItems = lodash
                        .chain(sourceItems)
                        .filter(ctx.filterFunction)
                        .map(ctx.mapperFunction)
                        .value();
                    if (targetItems.length > 0) {
                        let results = await ctx.mongoDBDAO.intertOrUpdateItems(targetItems);
                        console.log('Modified mongodb doc count : ', results.modifiedCount);
                        console.log('Inserted mongodb doc count : ', results.upsertedCount);
                    }
                    if (sourceItems.length > 0) {
                        readOffset = totalItemCount;
                    } else {
                        readOffset = null;
                    }
                    endTime = new Date().getTime();
                    console.log('Loop completion time : ', endTime - startTime, ' ms');
                    iteration++;
                } while (readOffset);
                console.log('Migration completed');
                resolve();
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }
}

module.exports = MigrationJob;