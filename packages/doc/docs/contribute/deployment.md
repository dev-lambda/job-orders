---
sidebar_position: 7
---

# Build, Publish and Deploy

## Locally testing the docker image

### Build the image

```sh
docker build . -t api-template:local
```

### Launch a development instance of mongodb (if needed) {#mongodb}

Create a local network for dependent docker instances (once only, optional)

```sh
docker network create local
```

Make sure a mongodb instance is running locally

- Create a new docker instance for mongodb (only once)

  ```sh
  docker run \
    --net local \
    -d \
    --name mongodb-dev \
    -p 27017:27017 \
    mongo:6
  ```

- ... or simply start an already created instance
  ```sh
  docker start mongodb-dev
  ```

### Run the image connecting it to your local mongodb instance

```sh
docker run \
  --rm \
  --name api-template \
  -p 8000:80 \
  --net local \
  --env mongoDbHost="mongodb://mongodb-dev:27017/prod" \
  --env logLevel="info" \
  api-template:local
```

This will keep a running instance attached to your terminal in order to easily monitor logs and will map the internal container port 80 to your local 8000 port. Your docker running server should be available at [http://localhost:8000/](http://localhost:8000/).

## Project assets

- [x] Docker image
- [ ] Npm package
- [ ] Helm chart

## CI Workflows

There are two main workflows, one is concerned with the project's assets (api, docker images, possibly npm packages) and the other is for the documentation website build and publishing.

Both workflow are independent.

### Build and publish

The responsibility of this workflow is to verify the code, build the project's assets and publish the result to the container or package registry.

Deploying those images to production or any other environment is not in the scope of this workflow.

#### Licences compliance verification

Prevent copyleft licences by allowing only an explicit subset of licenses.

The list of all currently allowed licenses: - MIT - ISC - 0BSD - BSD-2-Clause - BSD-3-Clause - CC-BY-3.0 - CC0-1.0 - Apache-2.0 - Python-2.0

:::tip
In order to add a new license to the list modify the `--onlyAllow` flag of the `license:check` npm script.
:::

#### Linter rules

Checks that all linter rules are respected.

:::tip
The linter rules are defined in the `.eslintrc.json` file.
:::

:::tip
This project is configured to use prettier as formatting assistant. You can use the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to keep the code format rules.
:::

#### Build

The main built asset

#### Test

Note that tests are run from the typescript sources, neither from the transpiled code nor the built docker image.

#### Publish

If all previous steps are ok, the final assets are ready to be published.

Docker images are tagged both with the version number and the commit tag. The version number is extracted from git tags, not the actual version in the `package.json file`. Note that the version major and minor labels are moving tags. The branch name is also added as a tag

:::tip
In order to publish a new version number you need to publish a tag in the form of `v1.0.0`.

```sh
git tag v1.0.0
git push --tags
```

:::

Docker images are published to the [github project's docker repository](https://github.com/dev-lambda/api-template/pkgs/container/api-template)

### Deploy

Not yet implemented.

### Publish documentation website to gh-pages

The documentation website is a static website built from the `/website` folder content.

The api documentation depends on the openAPI specification built from the `@openapi`-tagged jsdoc comments in the API codebase. This is thus a required step before compiling the static website.

Once the static site built, the contents are published to a `gh-pages` branch in the same repository. This branch is then published to the dedicated github page at: [https://dev-lambda.github.io/api-template/](https://dev-lambda.github.io/api-template/)

The action requires permissions to read and write on the repository. These permissions are requested by the action yaml file.

#### Github Setup

In order to activate the page publishing you need to set the following project setting on the [Github pages setup](https://github.com/dev-lambda/api-template/settings/pages):

- Deploy from a branch `gh-pages` `/(root)`
