/* eslint-disable @typescript-eslint/require-array-sort-compare */
import { writeFileSync } from "fs";
import { firstWordToUppercase } from "./helpers";

function getTypeArg(typeArg: string) {
  if (typeArg === "int" || typeArg === "uint" || typeArg === "float" || typeArg === "money") {
    return 1;
  }

  if (typeArg === "bool") {
    return "true";
  }

  if (typeArg === "date" || typeArg === "datetime") {
    return "01-02-2020";
  }

  return "test";
}

export function generateTest(component: string, functions?: string[]) {
  const scriptTest = `import { apiTestWrapper } from "@sdkgen/node-runtime";
import { api, Context } from "../src/api";
import "../src/controllers";
import { makeCtx } from "./helpers";

const { fn } = apiTestWrapper(api);

describe("${firstWordToUppercase(component)}", () => {
  let ctx: Context;

  beforeAll(() => {
    ctx = makeCtx({});
  });

  ${
    functions && functions.length
      ? functions
          .map(fun => {
            const [nameFunction, argsFunction] = fun.split("#");

            if (argsFunction) {
              const args = argsFunction.split(",");

              if (args.length > 1) {
                const params = args
                  .map(arg => {
                    const [nameArg, typeArg] = arg.split(":");

                    return `${nameArg}: "${getTypeArg(typeArg)}"`;
                  })
                  .sort()
                  .join(", ");

                return `test("${nameFunction}: should return a string", async () => {
    const res = await fn.${nameFunction}(ctx, { ${params} });

    expect(res).toBeTruthy();
    expect(typeof res).toBe("string");
  });
`;
              }

              const [nameArg, typeArg] = args[0].split(":");

              return `test("${nameFunction}: should return a string", async () => {
    const res = await fn.${nameFunction}(ctx, { ${nameArg}: "${getTypeArg(typeArg)}" });

    expect(res).toBeTruthy();
    expect(typeof res).toBe("string");
  });
`;
            }

            return `test("${nameFunction}: should return a string", async () => {
    const res = await fn.${nameFunction}(ctx, {});

    expect(res).toBeTruthy();
    expect(typeof res).toBe("string");
  });
`;
          })
          .join("\n  ")
      : `test("get${firstWordToUppercase(component)}", async () => {
    const res = await fn.get${firstWordToUppercase(component)}(ctx, {});

    expect(res).toBeTruthy();
    expect(typeof res).toBe("string");
  });
`
  }});
`;

  writeFileSync(`tests/${component}.test.ts`, scriptTest);
}
