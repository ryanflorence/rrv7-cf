const path = require("node:path");

const babel = require("@rollup/plugin-babel").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const typescript = require("@rollup/plugin-typescript");
const copy = require("rollup-plugin-copy");

const {
  isBareModuleId,
  createBanner,
  babelConfig,
  WATCH,
} = require("../../rollup.utils");
const { name: packageName, version } = require("./package.json");

/** @returns {import("rollup").RollupOptions[]} */
module.exports = function rollup() {
  return [
    {
      external(id) {
        return isBareModuleId(id);
      },
      input: "index.ts",
      output: {
        banner: createBanner(packageName, version),
        dir: "dist/esm",
        format: "esm",
        preserveModules: true,
      },
      plugins: [
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
          extensions: [".ts"],
          ...babelConfig,
        }),
        nodeResolve({ extensions: [".ts"] }),
      ],
    },
    {
      external(id) {
        return isBareModuleId(id);
      },
      input: "index.ts",
      output: {
        banner: createBanner(packageName, version),
        dir: "dist",
        format: "cjs",
        preserveModules: true,
        exports: "named",
      },
      plugins: [
        babel({
          babelHelpers: "bundled",
          exclude: /node_modules/,
          extensions: [".ts"],
          ...babelConfig,
        }),
        typescript({
          tsconfig: path.join(__dirname, "tsconfig.json"),
          exclude: ["__tests__"],
          noEmitOnError: !WATCH,
        }),
        nodeResolve({ extensions: [".ts"] }),
        copy({
          targets: [{ src: "../../LICENSE.md", dest: [__dirname] }],
        }),
      ],
    },
  ];
};
