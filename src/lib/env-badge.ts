/**
 * Which database is this deployment actually talking to?
 *
 * Preview and production can quietly share a DATABASE_URL, and the failure is
 * silent: test pools land in real demand and nothing on screen says so. The
 * admin page shows this so a misconfiguration is visible rather than inferred.
 *
 * The host only, never the credential.
 */
export function databaseLabel() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return { host: "not set", branch: null as string | null };
  try {
    const { hostname } = new URL(raw);
    // Neon hosts look like ep-floral-sunset-zadxzuag-pooler.c-2.eu-west-2.aws.neon.tech
    const endpoint = hostname.split(".")[0];
    return { host: hostname, branch: endpoint.replace(/-pooler$/, "") };
  } catch {
    return { host: "unparseable", branch: null };
  }
}

export function deploymentLabel() {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";
}
