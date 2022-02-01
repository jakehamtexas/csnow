import esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

esbuild.build({
	entryPoints: ["./src/index.ts"],
	outdir: "dist",
	bundle: true,
	target: ["node10.4", "node12", "node14", "node16"],
	platform: "node",
	loader: {
		".ts": "ts",
	},
	tsconfig: "./tsconfig.json",
	plugins: [nodeExternalsPlugin()],
	format: "esm",
	outExtension: {
		".js": ".mjs",
	},
});
