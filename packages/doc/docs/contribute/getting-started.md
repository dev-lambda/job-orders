---
sidebar_position: 0
---

# 5 min to get up and running

## Clone sources and install dependencies

```sh
git clone git@github.com:dev-lambda/api-template.git
cd api-template
npm run i
```

## Start a development server

:::note
This assumes you have a running mongodb instance and the connection string defined in `config/development.yaml` (`mongodb://localhost:27017/dev`) is correct.

If you don't yet have **a running mongodb instance** see [how to quickly launch a mongodb instance](./deployment#mongodb)

If you need to use a **different mongodb connection string** you can use the `config/local-development.yaml` file or the corresponding `mongoDbHost` environment varialbe (see [how to configure the app](./runtime#configuration-files).)
:::

```sh
npm start
```

Your local server should be available at [http://localhost:3000/](http://localhost:3000/).

For more development scripts see [npm-scripts](./npm-scripts#local-development).

## Configure the app for your local environment

You can cusomize configuration settings for your personal machine by creating a file `config/local-development.yaml` that will override default and development settings. This file should not be commited. For more information see [Runtime settings](./runtime#configuration-files).