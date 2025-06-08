// Utility to build the React app, only if built in the last 10 minutes

export async function buildReactApp() {
  const buildDir = `${Deno.cwd()}/react-app/build`;
  const buildStamp = `${buildDir}/.last-react-build`;
  let shouldBuild = true;
  try {
    const stat = await Deno.stat(buildStamp);
    const now = Date.now();
    const mtime = stat.mtime?.getTime() ?? 0;
    if (now - mtime < 10 * 60 * 1000) { // 10 minutes
      shouldBuild = false;
      console.log("Skipping React build: last build was less than 10 minutes ago.");
    }
  } catch (_) {
    // File does not exist, so we should build
  }
  // Skip build in CI/CD or Deno Deploy environments
  if (Deno.env.get("CI") === "true" || Deno.env.get("DENO_DEPLOYMENT_ID")) {
    console.log("Skipping React build in CI/CD or Deno Deploy environment.");
    return;
  }
  if (shouldBuild) {
    try {
      console.log("Building React app with 'corepack yarn build' in react-app directory...");
      const buildCmd = new Deno.Command("corepack", {
        args: ["yarn", "build"],
        cwd: `${Deno.cwd()}/react-app`,
        stdout: "inherit",
        stderr: "inherit",
      });
      const { code } = await buildCmd.output();
      if (code !== 0) {
        throw new Error(`React build failed with exit code ${code}`);
      }
      // Touch the build stamp file
      await Deno.writeTextFile(buildStamp, new Date().toISOString());
      console.log("React app built successfully.");
    } catch (err) {
      throw new Error(`Error running 'corepack yarn build' for React app: ${err}`);
    }
  }
}
