# Renga-ui

The development branch of the Renga user interface contains a complete rewrite of the old ui which reflects the redesign
of the Renga platform in general.   

# Quickstart
The new Renga ui depends on a running instace of the development version of Renga being present (more precisely, it relies on 
correctly prconfigured instances of gitlab and keycloak). Clone the main renga repository, checkout the development branch 
and run `make start`. The ui should now be available under `http://localhost`.

# Developing the UI
For a proper development setting run the following two commands after checking out the development branch of the 
renga-ui repository:
```
npm install
make dev
```
This will run the ui outside of docker and make it available under `http://localhost:3000` (a browser tab 
should open automatically). Note that also the development setting relies on a running instace of renga for gitlab and 
keycloak.

As long as you have executed `npm install` in your environment, you will have other commands defined in `package.json`,
such as `npm run lint`, etc., available to you.
