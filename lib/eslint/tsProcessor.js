import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);

function loadWithGlobalFallback(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    const nodePath = process.env.NODE_PATH;
    if (!nodePath) {
      throw error;
    }

    const searchRoots = nodePath.split(path.delimiter).filter(Boolean);

    for (const root of searchRoots) {
      try {
        const resolved = require.resolve(moduleName, { paths: [root] });
        return require(resolved);
      } catch (innerError) {
        if (innerError.code !== "MODULE_NOT_FOUND") {
          throw innerError;
        }
      }
    }

    throw error;
  }
}

const ts = loadWithGlobalFallback("typescript");

function createProcessor({ jsx }) {
  const compilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    jsx: jsx ? ts.JsxEmit.Preserve : ts.JsxEmit.None,
    sourceMap: false,
    importHelpers: false,
    esModuleInterop: true,
    allowJs: true,
    resolveJsonModule: true
  };

  return {
    preprocess(code, filePath) {
      const output = ts.transpileModule(code, {
        fileName: filePath,
        compilerOptions,
        reportDiagnostics: false
      });

      return [output.outputText];
    },
    postprocess(messageLists) {
      return messageLists.flat();
    },
    supportsAutofix: false
  };
}

function createJsxUsesVarsRule() {
  return {
    meta: {
      docs: {
        description: "Mark variables used in JSX expressions so no-unused-vars does not flag them.",
        recommended: false
      },
      schema: []
    },
    create(context) {
      const sourceCode = context.sourceCode || context.getSourceCode?.();

      function markName(node) {
        if (!node || !sourceCode || typeof sourceCode.markVariableAsUsed !== "function") {
          return;
        }

        if (node.type === "JSXIdentifier") {
          sourceCode.markVariableAsUsed(node.name, node);
          return;
        }

        if (node.type === "JSXMemberExpression") {
          markName(node.object);
        }
      }

      return {
        JSXOpeningElement(node) {
          markName(node.name);
        }
      };
    }
  };
}

export const tsProcessorPlugin = {
  processors: {
    typescript: createProcessor({ jsx: false }),
    tsx: createProcessor({ jsx: true })
  },
  rules: {
    "jsx-uses-vars": createJsxUsesVarsRule()
  }
};
