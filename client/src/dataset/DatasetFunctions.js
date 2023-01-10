function mapDataset(dataset_core, dataset_kg) {
  let dataset = {};
  if (dataset_core) {
    dataset = {
      name: dataset_core.name,
      title: dataset_core.title,
      description: dataset_core.description,
      created: dataset_core.created_at,
      published: {
        creator: dataset_core.creators
      },
      identifier: dataset_core.identifier,
      keywords: dataset_core.keywords,
      mediaContent: dataset_core.mediaContent,
      exists: true,
    };
    if (dataset_kg) {
      dataset.url = dataset_kg.url;
      dataset.sameAs = dataset_kg.sameAs;
      dataset.usedIn = dataset_kg.usedIn;
      dataset.insideKg = true;
      dataset.published.datePublished = dataset_kg.published && dataset_kg.published.datePublished ?
        dataset_kg.published.datePublished : undefined;
    }
    else {
      dataset.insideKg = false;
    }
    return dataset;
  }
  //while things are loading dataset_kg could be undefined
  if (dataset_kg) {
    dataset_kg.insideKg = true;
    dataset_kg.exists = true;
  }
  return dataset_kg;
}

function getDatasetAuthors(dataset) {
  if (!dataset) return null;

  return dataset.published !== undefined && dataset.published.creator !== undefined ?
    dataset.published.creator
      .map((creator) => creator.name + (creator.affiliation ? ` (${creator.affiliation})` : ""))
      .join("; ")
    : null;
}

/**
 * Display a file with some metadata. Has the following parameters:
 *
 * @param {Object[]} images - Images link arrays
 */
function getDatasetImageUrl(images) {
  try {
    // images could contain previous image url, so we get the last in the array.
    const index = images?.length - 1;
    return images[index]["_links"][0].href;
  }
  catch {
    return undefined;
  }
}

/**
 * Returns image url with extra parameter to avoid outdated cached url
 *
 * @param {string} imageUrl - Url image
 * @param {string} lastUpdateDate - last url update
 */
function getUpdatedDatasetImage(imageUrl, lastUpdateDate) {
  if (!imageUrl)
    return undefined;

  const lastUpdate = new Date(lastUpdateDate).getTime();
  return `${imageUrl}?${lastUpdate}`;
}

export { mapDataset, getDatasetAuthors, getDatasetImageUrl, getUpdatedDatasetImage };
