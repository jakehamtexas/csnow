/**
 * @type {import('ts-jest').InitialOptionsTsJest}
 */
const config = {
	preset: "ts-jest",
	globals: {
		"ts-jest": {
			tsconfig: "./test/tsconfig.json",
		},
	},
	transform: {
		"^.+\\.(js|ts|tsx)$": "ts-jest",
	},
	transformIgnorePatterns: ["node_modules/(?!fast-cartesian)"],
};

export default config;
