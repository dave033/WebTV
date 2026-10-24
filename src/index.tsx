import { $, serve } from "bun";
import { join, normalize } from "path";
import index from "./index.html";
import config from "../public/config.json";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");
const CLIENT_DIR = join(import.meta.dir, "client");
const isProd = process.env.NODE_ENV === "production";
const devIndex = isProd ? null : (await import("./index.html")).default;

const server = serve({
  port: config.port || 3000,
  routes: {
    "/assets/*": async (req) => {
      const { pathname } = new URL(req.url);
      const filePath = normalize(
        join(PUBLIC_DIR, decodeURIComponent(pathname)),
      );

      // block path traversal like /assets/../../.env
      if (!filePath.startsWith(PUBLIC_DIR)) {
        return new Response("Forbidden", { status: 403 });
      }

      const file = Bun.file(filePath);
      if (!(await file.exists())) {
        return new Response("Not found", { status: 404 });
      }
      return new Response(file);
    },

    "/api/execute-cli-command": {
      POST: async (req) => {
        try {
          const { cliCommand } = await req.json();
          const isValidCommand =
            config.apps?.some((app) => app.cliCommand === cliCommand) ||
            config.lockCommand === cliCommand;

          if (!isValidCommand) {
            return Response.json({
              success: false,
              message: "Command not found in config.json",
            });
          }
          await $`sh -c ${cliCommand}`;
          return Response.json({
            success: true,
            message: "Successfully Executed Cli ",
          });
        } catch (error) {
          console.error(error);
          return Response.json({
            success: false,
            message: "Something Went Wrong!",
          });
        }
      },
    },

    "/api/kill-standalone": async (req) => {
      try {
        setTimeout(shutdownApp, 150);
        return Response.json({ success: true, message: "Shutting down" });
      } catch (error) {
        console.error(error);
        return Response.json({
          success: false,
          message: "Something Went Wrong!",
        });
      }
    },

    "/api/run-standalone": () => {
      return Response.json({ success: true });
    },

    // Serve index.html for all unmatched routes.
    "/*": isProd
      ? async (req: Request) => {
          const { pathname } = new URL(req.url);
          const file = Bun.file(
            join(CLIENT_DIR, pathname === "/" ? "index.html" : pathname),
          );
          return (await file.exists())
            ? new Response(file)
            : new Response(Bun.file(join(CLIENT_DIR, "index.html")));
        }
      : devIndex!,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

const targetUrl = `http://localhost:${server.port}`;

let browserProcess: any;

try {
  browserProcess = Bun.spawn(
    [
      "flatpak",
      "run",
      "org.mozilla.firefox",
      "--kiosk",
      "--new-instance",
      targetUrl,
    ],
    { stdout: "inherit", stderr: "inherit" },
  );
  browserProcess.exited.then((code: number) =>
    console.log(`Firefox exited (${code})`),
  );
} catch (e) {
  console.error("Could not launch Flatpak Firefox:", e);
}

const shutdownApp = async () => {
  console.log("Shutting down WebTV and Firefox...");

  // Stop the Flatpak Firefox instance
  await $`flatpak kill org.mozilla.firefox`.nothrow().quiet();

  // Stop the browser launcher process
  browserProcess?.kill();

  process.exit(0);
};

process.on("SIGINT", shutdownApp);
process.on("SIGTERM", shutdownApp);