# incubator-renga-ui

Repo for exploring UI ideas

# Quickstart
After cloning the repository simply run `docker-compose up -d --build`. This will launch the incubator ui in development
mode and a [GitLab instance](https://hub.docker.com/r/gitlab/gitlab-ce/) in two separate docker containers. 
Note that the GitLab instance might take several minutes to start. Once everything is up and running you can access 
the Renga ui under `http://localhost:5000` and the GitLab ui under `http://localhost`.

# Creating a GitLab access token
For the time being, you have to create a GitLab token before you can do anything useful through the ui.
Open `http://localhost` using "root" as username and the initial password ("root-password" or whatever you have set 
in the docker-compose file). Now create an access token for the current user 
`http://localhost/profile/personal_access_tokens`. Now export the created access token and restart the services:
```
$ export GITLAB_SECRET_TOKEN=previously-created-token
$ docker-compose up -d
```

# Developing the ui
The docker-compose file mounts the `./src` and `./public` into the ui container. You can therefore simply open the source 
code files and start editing. The development server running inside the ui container will detect these changes and update 
the ui automatically. However, for serious development you might want to run the development server on your machine directly
and not inside a docker container. For this, change the target of the proxy definition inside `package.json` from 
`http://dev.gitlab` to `http://localhost` and the following commands:
```
npm install
npm start
```
This will make the ui available under `http://localhost:3000` (a browser tab should open automatically). In this mode you
will also be able to use other commands defined in `package.json` such as `npm run lint`, `npm build`, etc.   
