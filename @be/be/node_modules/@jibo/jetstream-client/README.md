# Jetstream Client

## Description

This project contains the client library for the on-robot Jetstream service, which acts as a ListenService and as a connection to the Jibo Hub

## Build

```
npm install
npm run build
```

## Command line interface

A couple of command line interfaces are provided for convenience in the `scripts` directory. Each accepts command line options which can be listed by providing parameters `-h` or `--help`.

```
$ node scripts/startLocalTurn.js -h
Usage: startLocalTurn.js [options]
  Options:
  --port, -p: [default: 4444] Port of service
  --host, -s: [default: localhost] Port of service
  --options, -o: [default '{"nluRules": ["launch"], "fakeASR": "some text"}'] Local turn options
```