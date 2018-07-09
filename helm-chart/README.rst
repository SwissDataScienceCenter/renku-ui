Renku UI Helm Chart
===================

Provide a basic chart for deploying Renku UI application.

Configuration
-------------

- `baseUrl` define the URL on the application will be available
  (default: `http://localhost:3000`)
- `gitlabUrl` define the URL of a running GitLab instance
  (default: `http://gitlab.renku.build`)
- `jupyterhubUrl` define the URL of a running JupyterHub instance
  (default: `http://jupyterhub.renku.build`)

Usage
-----

In the `helm-chart` directory:

.. code-block:: console

    helm upgrade --install renku-ui --values minikube-values.yaml renku-ui


To rebuild the images and update the chart you can run

.. code-block:: console

    pip install chartpress
    chartpress
