import { structureHelpersBy, CombinatoricStructureType, CombinatoricStructure, Collection, extractValues } from "./combinatoric";

export const { make, isSpecimen, rangeWith, iterateBy, strict } = structureHelpersBy(
	CombinatoricStructureType.OneOf,
	(collection: Collection<unknown>) => ({
		type: CombinatoricStructureType.OneOf,
		array: extractValues(collection),
	})
);
export type Structure = CombinatoricStructureType.OneOf;
export type Node = CombinatoricStructure[Structure];
