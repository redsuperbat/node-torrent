# NodeTorrent

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run start:dev
```

This starts the vue-cli build command with the watch flag as well as the express server that serves all the files.

## Description

This project is ment to run alongside plex in a docker container. Preferrably using docker compose. In the root of this project there is an example [docker compose](docker-compose.yml) that features an example setup with plex and NodeTorrent.

The docker image is available on dockerhub as maxrsb/node-torrent. Link to dockerhub is [here](https://hub.docker.com/repository/docker/maxrsb/node-torrent).

### Running it without docker
Running the project without docker is also fine. This will require Node to be installed on your system. 

#### Setup
- Clone the repo
- Navigate into the root dir
- run `npm i` to install dependecies
- run `npm run build` to build the project
- run `npm run start` to start NodeTorrent

#### Specifying download directories
To specify which directories that NodeTorrent will download into you have to set specific env variables when running the project.
Specifying `/downloads` as your download directory:
Linux:
`DOWNLOAD_DIR=/downloads npm run start`
Windows: 
`DOWNLOAD_DIR=/downloads && npm run start`

## Screenshots

<p align="center">
<kbd><img src="gallery/login.png" width="350" /> </kbd>
<kbd><img src="gallery/home.png" width="350" /> </kbd>
<kbd><img src="gallery/add.png" width="350" /> </kbd>
<kbd><img src="gallery/add2.png" width="350" /> </kbd>
<kbd><img src="gallery/torrents.png" width="350" /> </kbd>
</p>
