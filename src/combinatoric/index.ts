import { CombinatoricStructuresUnion } from "./combinatoric";
import * as KOf from "./kOf";
import * as OneOf from "./oneOf";

export { KOf, OneOf };
export const isCombinatoricStructure = (v: unknown): v is CombinatoricStructuresUnion => [KOf, OneOf].some((space) => space.isSpecimen(v));
