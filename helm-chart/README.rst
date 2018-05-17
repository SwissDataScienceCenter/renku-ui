Renku UI Helm Chart
===================

Provide a basic chart for deploying Renku UI application.

Configuration
-------------

- `baseUrl` define URL on which will be the application available
  (default: `http://localhost:3000`)
- `gitlabUrl` define URL of a running GitLab instance
  (default: `http://gitlab.renku.build`)

Usage
-----

In the `helm-chart` directory:

```
helm upgrade --install renku-ui --values minikube-values.yaml renku-ui
```
