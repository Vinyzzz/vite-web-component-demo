import {defineConfig} from "vite";

let hmr: boolean;

export default defineConfig(env => {
  const isProduction = env.mode === 'production';
  return {
    plugins: [isProduction && {
      name: "vite-plugin-html-minify",
      enforce: 'post',
      transform(code, id) {
        if (id.endsWith('.html?raw')) {
          return code
            .replace(/(?<=>)(\\r|\\n|\s)+(?=<)/g, '')
            .replace(/[\\\srn]+"$/, '"')
            .replace(/(?<=\S)(\\r|\\n|\s)+(?=\S)/g, ' ');
        }
        return code;
      }
    }, {
      name: "vite-plugin-stylesheet",
      enforce: 'post',
      config(config, {command}) {
        hmr = command === 'serve' && config.server?.hmr !== false;
      },
      handleHotUpdate({server, timestamp, modules}) {
        if (modules.length && /\.scss\?.*\binline$/.test(modules[0].id)) {
          server.ws.send({
            type: "update",
            updates: modules.map(module => ({
              type: 'js-update',
              timestamp,
              path: module.url,
              acceptedPath: module.url,
            })),
          });
          return [];
        }
      },
      transform(code, id) {
        if (/\.scss\?.*?stylesheet$/.test(id)) {
          let lines: Array<string>;
          if (hmr) {
            code = code.split('\n')[2];
            code = code.slice(20);
            code = `stylesheet.replace(${code})`;
            lines = [
              'import.meta.hot.accept()',
              'let {data}=import.meta.hot',
              'let stylesheet=data.stylesheet||(data.stylesheet=new CSSStyleSheet())',
              code,
              'export default stylesheet',
            ];
          } else {
            lines = [
              'export default (stylesheet=>{',
              `stylesheet.replace(${code.slice(15)})`,
              'return stylesheet',
              '})(new CSSStyleSheet())',
            ];
          }
          return lines.join('\n');
        } else {
          return code;
        }
      },
    }],
    server: {
      port: 80,
      watch: {
        ignored: ['**/.git/**', '**/.idea/**', '**/.vscode/**', '**/dist/**', '**/dist_not_minify/**'],
      },
      proxy: {},
    },
    build: {
      target: 'es2020',
      reportCompressedSize: false,
      minify: isProduction ? 'esbuild' : false,
      outDir: isProduction ? 'dist' : "dist_not_minify",
    },
  };
});