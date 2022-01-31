import { AnyArray } from "../util";
import { structureHelpersBy, CombinatoricStructure, CombinatoricStructures } from "./combinatoric";

export const { make, isSpecimen, rangeWith, iterateBy } = structureHelpersBy(CombinatoricStructure.OneOf, (array: AnyArray) => ({
	type: CombinatoricStructure.OneOf,
	array,
}));
export type Structure = CombinatoricStructure.OneOf;
export type Node = CombinatoricStructures[Structure];
