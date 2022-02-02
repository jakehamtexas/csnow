import { structureHelpersBy, CombinatoricStructureType, CombinatoricStructure } from "./combinatoric";

export const { make, isSpecimen, rangeWith, iterateBy, strict } = structureHelpersBy(CombinatoricStructureType.KOf, (k, array) => ({
	type: CombinatoricStructureType.KOf,
	array,
	k,
}));

export type Structure = CombinatoricStructureType.KOf;
export type Node = CombinatoricStructure[Structure];
