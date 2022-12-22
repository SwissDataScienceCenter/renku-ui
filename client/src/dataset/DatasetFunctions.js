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
    return images[0]["_links"][0].href;
  }
  catch {
    return undefined;
  }
}

export { mapDataset, getDatasetAuthors, getDatasetImageUrl };
