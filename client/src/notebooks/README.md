# Session Support

The logic behind sessions is complex because the process of identifying if a session can be started is complicated.

# Find image

```mermaid
stateDiagram-v2
    [*] --> GetRemoteImage
    [*] --> GetProjectImage

    GetProjectImage --> Error
    GetProjectImage --> Found

    GetRemoteImage --> Error
    GetRemoteImage --> Found

    Found --> [*]
    Error --> [*]

    state GetProjectImage {
      [*] --> GetRegistry

      GetRegistry --> pi_error
      GetRegistry --> GetImage
      GetRegistry --> Unavailable

      GetImage --> pi_error
      GetImage --> pi_found
      GetImage --> Unavailable

      Unavailable --> GetImage: if anon
      Unavailable --> GetPipelines
      GetPipelines --> GetJobs
      GetJobs --> JobSuccess
      GetJobs --> JobFail
      GetJobs --> JobRunning

      JobSuccess --> GetProjectImageNoEscape

      GetProjectImageNoEscape --> pi_error
      GetProjectImageNoEscape --> pi_found
      JobFail --> pi_error
      JobRunning --> GetJobs

      pi_found --> [*]
      pi_error --> [*]
    }

    state GetProjectImageNoEscape {
      [*] --> no_escape_GetRegistry

      no_escape_GetRegistry --> no_escape_error
      no_escape_GetRegistry --> no_escape_Image

      no_escape_Image --> no_escape_error
      no_escape_Image --> no_escape_found
      no_escape_Image --> no_escape_Unavailable
      no_escape_Image --> no_escape_Jobs

      no_escape_Unavailable --> no_escape_Image: if anon
      no_escape_Jobs --> no_escape_JobSuccess
      no_escape_Jobs --> no_escape_JobFail
      no_escape_Jobs --> no_escape_JobRunning

      no_escape_JobSuccess --> no_escape_Registry: if no initial registry
      no_escape_JobSuccess --> no_escape_Image
      no_escape_JobFail --> no_escape_error
      no_escape_JobRunning --> no_escape_Jobs

      no_escape_found --> [*]
      no_escape_error --> [*]
    }
```
