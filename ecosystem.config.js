module.exports = {
    apps : [{
        name: `image-comparer`,
        cwd: __dirname,
        script: "./image-comparer.js",
        env: {
          PORT: 3030,
        },
        max_memory_restart: "700M",
        node_args: [],
        exec_mode: "fork",
        out_file: "/dev/null",
        error_file: "/dev/null",
    }],
  };
  