import { describe, expect, it } from "vitest";

import {
  addMarqueeImageToDataset,
  cleanDatasetId,
  Dataset,
} from "./Dataset.utils";

describe("addMarqueeImageToDataset", () => {
  const gitUrl = "https://github.com/user/repo";
  it("should complete the git url in the dataset object when content_url is a git url", () => {
    const dataset: Dataset = {
      images: [{ content_url: ".renku/dataset_images/image.jpg" }],
    };

    const result = addMarqueeImageToDataset(gitUrl, dataset);

    expect(result.mediaContent).toBe(
      `${gitUrl}/-/raw/master/.renku/dataset_images/image.jpg`
    );
  });

  it("should complete the git url when content_url is a git url and include a default branch", () => {
    const dataset: Dataset = {
      images: [{ content_url: ".renku/dataset_images/image.jpg" }],
    };

    const result = addMarqueeImageToDataset(gitUrl, dataset, "no-master");

    expect(result.mediaContent).toBe(
      `${gitUrl}/-/raw/no-master/.renku/dataset_images/image.jpg`
    );
  });

  it("should add the url of the image as it is in the dataset when content_url is not a git url", () => {
    const dataset: Dataset = {
      images: [{ content_url: "https://example.com/image.jpg" }],
    };

    const result = addMarqueeImageToDataset(gitUrl, dataset);

    expect(result.mediaContent).toBe("https://example.com/image.jpg");
  });

  it("should add the url of the image when content_url start with a URL scheme", () => {
    const dataset: Dataset = {
      images: [{ content_url: "s3://example/image.jpg" }],
    };

    const result = addMarqueeImageToDataset(gitUrl, dataset);

    expect(result.mediaContent).toBe("s3://example/image.jpg");
  });

  it("should return the object without change if there is not an image", () => {
    const gitUrl = "https://github.com/user/repo";
    const dataset: Dataset = { images: [] };

    const result = addMarqueeImageToDataset(gitUrl, dataset);

    expect(result).toBe(dataset);
  });
});

describe("cleanDatasetId", () => {
  it("should remove dashes from the dataset identifier", () => {
    const dataset: Dataset = { identifier: "data-set-Id", images: [] };

    cleanDatasetId(dataset);

    expect(dataset.identifier).toBe("datasetId");
  });

  it("should do nothing when the identifier is undefined", () => {
    const dataset: Dataset = {};

    cleanDatasetId(dataset);

    expect(dataset?.identifier).toBe(undefined);
  });
});
