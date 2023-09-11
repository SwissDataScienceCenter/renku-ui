import {
  addMarqueeImageToDataset,
  cleanDatasetId,
  IDataset,
} from "./DatasetFunctions";

describe("addMarqueeImageToDataset", () => {
  it("should complete the git url in the dataset object when content_url is a git url", () => {
    const gitUrl = "https://github.com/user/repo";
    const dataset: IDataset = {
      identifier: "dataset-id",
      images: [
        { content_url: ".renku/dataset_images/image.jpg" },
        { content_url: "other/image.jpg" },
      ],
    };

    const result = addMarqueeImageToDataset(gitUrl, dataset);

    expect(result.mediaContent).toBe(
      `${gitUrl}/-/raw/master/.renku/dataset_images/image.jpg`
    );
  });

  it("should add the url of the image as it is in the dataset when content_url is not a git url", () => {
    const gitUrl = "https://github.com/user/repo";
    const dataset: IDataset = {
      identifier: "dataset-id",
      images: [{ content_url: "other/image.jpg" }],
    };

    const result = addMarqueeImageToDataset(gitUrl, dataset);

    expect(result.mediaContent).toBe("other/image.jpg");
  });

  it("should return the object without change if there is not an image", () => {
    const gitUrl = "https://github.com/user/repo";
    const dataset: IDataset = {
      identifier: "dataset-id",
      images: [],
    };

    const result = addMarqueeImageToDataset(gitUrl, dataset);

    expect(result).toBe(dataset);
  });
});

describe("cleanDatasetId", () => {
  it("should remove dashes from the dataset identifier", () => {
    const dataset: IDataset = { identifier: "data-set-Id", images: [] };

    cleanDatasetId(dataset);

    expect(dataset.identifier).toBe("datasetId");
  });

  it("should do nothing when the identifier is undefined", () => {
    const dataset: IDataset = {};

    cleanDatasetId(dataset);

    expect(dataset?.identifier).toBe(undefined);
  });
});
