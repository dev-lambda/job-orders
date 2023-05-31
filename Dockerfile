FROM node:18-alpine as nodeimage

# set api port to 80, and expose
ENV PORT=80
EXPOSE 80

# set base directory
WORKDIR /workspace

# install dependencies layer

## allow private npm packages
ARG GITHUB_TOKEN
COPY .npmrc-ci .npmrc

## actually install dependencies (force layer creation on package.json changes)
COPY package*.json ./
COPY packages/dto ./packages/dto
COPY packages/api ./packages/api

RUN npm ci -include-workspace-root -workspace @dev-lambda/api-template

## cleanup private npm packages setup
RUN rm .npmrc

# copy all necessary (remaining) files and build (use .dockerignore to exclude specific files)
COPY tsconfig.json ./
RUN npm run build --workspace @dev-lambda/api-template-dto
RUN npm run build --workspace @dev-lambda/api-template

# remove dev-dependencies
RUN npm prune --omit=dev

# run production server
ENV NODE_ENV=production
CMD npm run prod
