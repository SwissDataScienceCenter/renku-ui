# incubator-renga-ui

Repo for exploring UI ideas

# Running the UI

```
$ npm install        # normally only necessary the first time or if dependencies have changed
$ npm start
```

Then point your browser at http://localhost:3000/ (this should automatically happen). This will show you a welcome page. To actually do anything interesting, you need a metadata server.

# Running the Metadata Server

Get the renga-metadata project: https://github.com/SwissDataScienceCenter/renga-metadata. The README.rst file in the project explains how to get it up and running, but here is a condensed version.

## First Time

The first time, you will need to build and initialize it.

```
$ docker-compose up --build -d
$ docker-compose exec web renga-metadata db init create
$ docker-compose exec web renga-metadata index init
```

## Second Time+

Subsequently, it will be sufficient to just bring it up.

```
$ docker-compose up -d
```

## Reinitialization

During development, the schema or other information may change, necessitating a reinitialization of the server. If more gentle methods fail, you can destroy everything and start again:

```
$ docker-compose down
```

Then follow the instructions in [First Time](#first-time).


## Useful Commands

Here are some commands that may be useful for interacting with the metadata server.

### Retrieve Entities

```
$ curl -i -H 'Accept: application/json' http://localhost:5000/datasets/
$ curl -i -H 'Accept: application/json' http://localhost:5000/kus/
```

### Create Entities

```
$ curl -i -XPOST -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{"title": "dataset 1"}' http://localhost:5000/datasets/
$ curl -i -XPOST -H 'Accept: application/json' -H 'Content-Type: application/json' -d '{"title": "ku 1"}' http://localhost:5000/kus/
```
