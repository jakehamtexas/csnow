import { structureHelpersBy, CombinatoricStructure, CombinatoricStructures } from "./combinatoric";

export const { make, isSpecimen, rangeWith, iterateBy } = structureHelpersBy(CombinatoricStructure.KOf, (k, array) => ({
	type: CombinatoricStructure.KOf,
	array,
	k,
}));

export type Structure = CombinatoricStructure.KOf;
export type Node = CombinatoricStructures[Structure];
