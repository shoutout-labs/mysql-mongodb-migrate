'use strict';
//loading environment variables
require('dotenv').config()
const config = require('./src/config');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    region: config.AWS_REGION
});
const fs = require('fs');

function loadMapperFile() {
    return new Promise((resolve, reject) => {
        try {
            let params = { Bucket: config.MAPPER_BUCKET_NAME, Key: config.MAPPER_OBJECT_KEY };
            let filePath = './metadata.js';
            s3.getObject(params, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    fs.writeFileSync(filePath, data.Body.toString());
                    resolve();
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

(async () => {
    try {
        console.log('Loading mapper file...')
        await loadMapperFile();
        console.log('Mapper file loaded')
        const MigrationJob = require('./index');
        const metadata = require('./metadata');

        let sourceConnectionOptions = {
            host: config.MYSQL_HOST,
            port: config.MYSQL_PORT,
            user: config.MYSQL_USER,
            password: config.MYSQL_PASSWORD
        };
        let targetConnectionOptions = {
            host: config.MONGODB_ENDPOINT,
            user: config.MONGODB_USERNAME,
            password: config.MONGODB_PASSWORD
        };

        const migrationJob = new MigrationJob(config.MYSQL_DATABASE_NAME, config.MYSQL_TABLE_NAME, config.MONGODB_DATABASE_NAME, config.MONGODB_COLLECTION_NAME, sourceConnectionOptions, targetConnectionOptions, config.MYSQL_READ_LIMIT_PER_ITERATION, config.MYSQL_READ_THROUGHPUT);
        if (metadata.filterExpression) {
            migrationJob.setSourcefilterExpression(metadata.filterExpression);
        }
        if (metadata.filterFunction) {
            migrationJob.setFilterFunction(metadata.filterFunction);
        }
        if (metadata.mapperFunction) {
            migrationJob.setMapperFunction(metadata.mapperFunction);
        }

        console.log('Running migration...')
        await migrationJob.run();
        process.exit(0);
    } catch (error) {
        console.error('Migration error', error);
        process.exit(1);
    }
})();
