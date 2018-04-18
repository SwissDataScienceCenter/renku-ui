Renga UI Helm Chart
===================

Provide a basic chart for deploying Renga UI application.

Configuration
-------------

- `baseUrl` define URL on which will be the application available
  (default: `http://localhost:3000`)
- `gitlabUrl` define URL of a running GitLab instance
  (default: `http://gitlab.renga.build`)

Usage
-----

In the `helm-chart` directory:

```
helm upgrade --install renga-ui --values minikube-values.yaml renga-ui
```
