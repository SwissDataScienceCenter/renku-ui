function fixFetchedFiles(core_files, kg_files) {
  if (core_files) {
    if (core_files.error) return core_files;
    return core_files;
  }
  return kg_files;
}

function mapDataset(dataset_core, dataset_kg, core_files) {
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
      hasPart: fixFetchedFiles(core_files, dataset_kg ? dataset_kg.hasPart : undefined)
    };
    if (dataset_kg) {
      dataset.url = dataset_kg.url;
      dataset.sameAs = dataset_kg.sameAs;
      dataset.isPartOf = dataset_kg.isPartOf;
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
  if (dataset_kg)
    dataset_kg.insideKg = true;
  return dataset_kg;
}

export { mapDataset };
