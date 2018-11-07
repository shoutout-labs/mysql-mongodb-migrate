# MySQL MongoDB Migrate

[![npm version](https://badge.fury.io/js/mysql-mongodb-migrate.svg)](https://badge.fury.io/js/mysql-mongodb-migrate)
[![Build Status](https://travis-ci.org/shoutout-labs/mysql-mongodb-migrate.svg?branch=master)](https://travis-ci.org/shoutout-labs/mysql-mongodb-migrate)

Data migration module for migrating mysql tables to mongodb db collections

## Installing

```shell
npm install mysql-mongodb-migrate --save
```

## Quick Usage

```javascript
const MigrationJob = require('mysql-mongodb-migrate');

let sourceConnectionOptions = {
    host: <MYSQL_HOST>,
    port: <MYSQL_PORT>,
    user: <MYSQL_USER>,
    password: <MYSQL_PASSWORD>,
    ssl: <MYSQL_SSL> //optional (Ex:- 'Amazon RDS')
};
let targetConnectionOptions = {
    host: <MONGODB_ENDPOINT>,
    user: <MONGODB_USERNAME>,
    password: <MONGODB_PASSWORD>
};

const migrationJob = new MigrationJob(<MYSQL_DATABASE_NAME>, <MYSQL_TABLE_NAME>, <MONGODB_DATABASE_NAME>, <MONGODB_COLLECTION_NAME>, sourceConnectionOptions, targetConnectionOptions, <MYSQL_READ_LIMIT_PER_ITERATION>, <MYSQL_READ_THROUGHPUT>);


migrationJob.run()
```

## Adavance Usage

### Initialize

```javascript
const MigrationJob = require('mysql-mongodb-migrate');

let sourceConnectionOptions = {
    host: <MYSQL_HOST>,
    port: <MYSQL_PORT>,
    user: <MYSQL_USER>,
    password: <MYSQL_PASSWORD>,
    ssl: <MYSQL_SSL> //optional (Ex:- 'Amazon RDS')
};
let targetConnectionOptions = {
    host: <MONGODB_ENDPOINT>,
    user: <MONGODB_USERNAME>,
    password: <MONGODB_PASSWORD>
};

const migrationJob = new MigrationJob(<MYSQL_DATABASE_NAME>, <MYSQL_TABLE_NAME>, <MONGODB_DATABASE_NAME>, <MONGODB_COLLECTION_NAME>, sourceConnectionOptions, targetConnectionOptions, <MYSQL_READ_LIMIT_PER_ITERATION>, <MYSQL_READ_THROUGHPUT>);
```

### Set dynamodb filter expression - filter when scanning dynamodb

```javascript
const filterExpression = 'attr1 = val1';

migrationJob.setSourcefilterExpression(filterExpression);
```

### Set data filter function - filter after scan result - similar to lodash filter

```javascript
const filterFunction = (item) =>{
    return item.attr1 !== null;
}

migrationJob.setFilterFunction(metadata.filterFunction);
```

### Set data mapper function - similar to lodash map

```javascript
const mapperFunction = (item) =>{
    return {
        mappedAttr1 : item.attr1,
        mappedAttr2 : item.attr2
    }
}

migrationJob.setMapperFunction(mapperFunction);
```

### Run

```javascript
migrationJob.run()
```

## Testing

```shell
npm test
```
