# SessionProjectDockerImage

Documentation on the state machine used in `SessionProjectDockerImage` which
provides the current state of a project's Docker image ("available",
"not-available", "building").

```mermaid
---
title: Get Docker Image Status (simplified)
---
stateDiagram-v2
  [*] --> unknown

  unknown --> checkingCiRegistry

  checkingCiRegistry --> checkingCiImage: success
  checkingCiRegistry --> checkingCiPipelines: error

  checkingCiImage --> available: success
  checkingCiImage --> checkingCiPipelines: error

  checkingCiPipelines --> checkingCiJobs: success
  checkingCiPipelines --> checkingCiPipelines: no pipeline yet
  checkingCiPipelines --> error: error

  checkingCiJobs --> checkingCiDoneRegistry: job finished
  checkingCiJobs -->  ciJobRunning: job running
  checkingCiJobs --> checkingCiJobs: no pipeline job yet
  checkingCiJobs --> error: error

  ciJobRunning --> checkingCiJobs: after 5 seconds

  checkingCiDoneRegistry --> checkingCiDoneImage: success
  checkingCiDoneRegistry --> error: error

  checkingCiDoneImage --> available: success
  checkingCiDoneImage --> waitingCiImage: error

  waitingCiImage --> checkingCiDoneImage: after 5 seconds

  available --> [*]
  error --> [*]

  state "checking-ci-registry" as checkingCiRegistry
  state "checking-ci-image" as checkingCiImage
  state "checking-ci-pipelines" as checkingCiPipelines
  state "checking-ci-jobs" as checkingCiJobs
  state "checking-ci-done-registry" as checkingCiDoneRegistry
  state "ci-job-running" as ciJobRunning
  state "checking-ci-done-image" as checkingCiDoneImage
  state "waiting-ci-image" as waitingCiImage
```

The actual state machine also has states with `<state>-start`. These states
exist to make sure the associated API queries are fired only once, as the
state machine goes from `<state>-start` to `<state>` when the API query is
resolved.
