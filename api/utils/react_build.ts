// Utility to build the React app, only if not built in the last 10 minutes

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
        console.error(`React build failed with exit code ${code}`);
        Deno.exit(code);
      }
      // Touch the build stamp file
      await Deno.writeTextFile(buildStamp, new Date().toISOString());
      console.log("React app built successfully.");
    } catch (err) {
      console.error("Error running 'corepack yarn build' for React app:", err);
      Deno.exit(1);
    }
  }
}
