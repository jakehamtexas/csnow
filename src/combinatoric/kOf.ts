import { structureHelpersBy, CombinatoricStructureType, CombinatoricStructure, extractValues } from "./combinatoric";

export const { make, isSpecimen, rangeWith, iterateBy, strict } = structureHelpersBy(CombinatoricStructureType.KOf, (k, collection) => ({
	type: CombinatoricStructureType.KOf,
	array: extractValues(collection),
	k,
}));

export type Structure = CombinatoricStructureType.KOf;
export type Node = CombinatoricStructure[Structure];
