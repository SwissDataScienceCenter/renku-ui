# Session Support

The logic behind sessions is complex because the process of identifying if a session can be started is complicated.

Here is a recap. When reaching an error state, we generally keep polling the resource,
but we also show immediate feedback to the user since it's unlikely we can recover (see labels).
Project owners can usually trigger actions to start pipelines or jobs again.

# Find image

```mermaid
stateDiagram-v2
  [*] --> GetPinnedImage: pinned image 
  [*] --> GetProjectImage: project image

  GetProjectImage --> Found

  GetPinnedImage --> Error
  GetPinnedImage --> Found

  note right of Error : Image N/A, refresh page
  Found --> [*]

  state GetProjectImage {
    [*] --> GetImageRegistry

    GetImageRegistry --> RegistryError
    GetImageRegistry --> GetImage

    RegistryError --> GetPipelines: logged
    note right of RegistryError : Image N/A if anonymous

    GetImage --> ImageError
    GetImage --> ImageAvailable

    ImageAvailable --> [*]

    ImageError --> LoopImage : anonymous
    ImageError --> GetPipelines: logged

    GetPipelines --> PipelinesAvailable
    GetPipelines --> PipelinesError

    PipelinesAvailable --> GetJobs
    PipelinesError --> GetPipelines
    note right of PipelinesError : Trigger pipeline if owner

    GetJobs --> JobsAvailable
    GetJobs --> JobsError

    JobsAvailable --> GetJob
    JobsError --> GetJobs
    note right of JobsError : Retrigger job if owner

    GetJob --> JobSuccess
    GetJob --> JobFailOrError
    GetJob --> JobRunning

    JobSuccess --> LoopImage
    JobRunning --> JobRunning: still running
    JobRunning --> JobSuccess
    JobRunning --> JobFailOrError

    LoopImage --> ImageAvailable
    LoopImage --> ImageNotAvailable
    note right of JobFailOrError : Retrigger job if owner

    ImageNotAvailable --> LoopImage
    note right of ImageNotAvailable : Image N/A
  }
```
