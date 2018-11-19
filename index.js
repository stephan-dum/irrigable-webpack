const MemoryFS = require("memory-fs");
const { Transform } = require("stream");
const path = require("path");

class IrrigableWebpack extends Transform {
  constructor(config, wp, vinyl) {
    super({
      objectMode : true
    });

    this.cwd = vinyl.cwd;
    this.base = vinyl.base;
    this.webpack = wp || require("webpack");
    this.entry = {};

    this.config = {
      context : this.cwd,
      ...config,
      output : Object.assign({
          filename : "[name].js",
          path : "/"
        },
        config.output,
      )
    };
  }
  _transform(vinyl, encoding, callback) {
    this.entry[path.basename(vinyl.relative, vinyl.extname)] = vinyl.path;

    let compiler = this.webpack({
      entry : vinyl.path,
      ...this.config
    });

    let mfs = compiler.outputFileSystem = new MemoryFS();

    compiler.run((error, stats) => {
      if(error) {
        return callback(error);
      }

      vinyl.contents =  mfs.readFileSync(
        mfs.join(compiler.outputPath, "main.js")
      );

      vinyl.dependencies.push(...stats.compilation.fileDependencies)

      callback(null, vinyl);
    });
  }
}

module.exports = IrrigableWebpack;
