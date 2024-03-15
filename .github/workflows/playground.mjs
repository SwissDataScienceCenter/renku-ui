import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: "REDACTED",
});

const {
  data: { login },
} = await octokit.rest.users.getAuthenticated();
console.log(`Connected as ${login}`);

async function getOldEnvironments() {
  const now = new Date();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1_000;

  const {
    data: { environments, total_count },
  } = await octokit.request("GET /repos/{owner}/{repo}/environments", {
    owner: "SwissDataScienceCenter",
    repo: "renku-ui",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!environments) {
    return [];
  }

  if (total_count && environments.length < total_count) {
    console.log(
      `Seeing only ${environments.length} environments out of ${total_count}`
    );
  }

  const oldEnvironments = environments
    .filter(({ updated_at }) => now - new Date(updated_at) > SEVEN_DAYS)
    .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
  return oldEnvironments;
}

async function getActiveDeployment(environment) {
  const { data: deployments } = await octokit.request(
    "GET /repos/{owner}/{repo}/deployments",
    {
      owner: "SwissDataScienceCenter",
      repo: "renku-ui",
      environment,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  const deploymentStatuses = await Promise.all(
    deployments.map(async ({ id }) => {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
        {
          owner: "SwissDataScienceCenter",
          repo: "renku-ui",
          deployment_id: `${id}`,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      const isSuccess = data.some(({ state }) => state === "success");
      const isInactive = data.some(({ state }) => state === "inactive");
      const environment_url = data.find(
        ({ environment_url, state }) => !!environment_url && state === "success"
      )?.environment_url;
      return { id, isSuccess, isInactive, environment_url };
    })
  );
  const activeDeploymentStatus = deploymentStatuses.find(
    ({ isSuccess, isInactive }) => isSuccess && !isInactive
  );
  const activeDeployment = deployments.find(
    ({ id }) => id === activeDeploymentStatus?.id
  );
  return [activeDeployment, activeDeploymentStatus?.environment_url];
}

async function decideIfEnvironmentShouldBeDeleted(
  activeDeployment,
  environment_url
) {
  if (!activeDeployment || !environment_url) {
    return "delete";
  }
  try {
    const { status } = await fetch(environment_url);
    if (status >= 200 && status < 400) {
      return "keep";
    }
    return "delete";
  } catch {
    return "error";
  }
}

const oldEnvironments = await getOldEnvironments();

for (let i = 0; i < oldEnvironments.length; ++i) {
  const environment = oldEnvironments[i];

  console.log(`Processing environment: ${environment.name}`);

  const [activeDeployment, environment_url] = await getActiveDeployment(
    environment.name
  );
  const decision = await decideIfEnvironmentShouldBeDeleted(
    activeDeployment,
    environment_url
  );

  console.log(`Decision: ${decision}`);

  if (decision === "delete") {
    await octokit.request(
      "DELETE /repos/{owner}/{repo}/environments/{environment}",
      {
        owner: "SwissDataScienceCenter",
        repo: "renku-ui",
        environment: environment.name,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
  }
}
