/* eslint-env jest */
import { transform } from '@babel/core'; // eslint-disable-line import/no-extraneous-dependencies
import plugin from '../src';

// According to https://github.com/tc39/proposal-dynamic-import

describe('import()', () => {
  const transformerOpts = {
    babelrc: false,
    plugins: [
      // We need to add the corresponding syntax plugin
      // in order to parse the `import()`-calls
      '@babel/plugin-syntax-dynamic-import',
      [plugin, {
        root: [
          './test/testproject/src',
        ],
        alias: {
          test: './test/testproject/test',
        },
      }],
    ],
  };

  it('should resolve the path based on the root config', () => {
    const code = 'import("components/Header/SubHeader").then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import("./test/testproject/src/components/Header/SubHeader").then(() => {}).catch(() => {});');
  });

  it('should alias the path', () => {
    const code = 'import("test").then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import("./test/testproject/test").then(() => {}).catch(() => {});');
  });

  it('should not change a relative path', () => {
    const code = 'import("./utils").then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import("./utils").then(() => {}).catch(() => {});');
  });

  it('should handle the first argument not being a string literal', () => {
    const code = 'import(path).then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import(path).then(() => {}).catch(() => {});');
  });

  it('should handle an empty path', () => {
    const code = 'import("").then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import("").then(() => {}).catch(() => {});');
  });

  it('should handle imports added by other transforms', () => {
    const options = {
      ...transformerOpts,
      plugins: [
        function fakePlugin({ types }) {
          return {
            visitor: {
              Identifier(path) {
                path.replaceWith(types.Import());
              },
            },
          };
        },
        ...transformerOpts.plugins,
      ],
    };
    const code = 'boo("components/Header/SubHeader");';
    const result = transform(code, options);

    expect(result.code).toBe('import("./test/testproject/src/components/Header/SubHeader");');
  });
});
