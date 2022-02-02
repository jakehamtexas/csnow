import { AnyArray } from "../util";
import { structureHelpersBy, CombinatoricStructureType, CombinatoricStructure } from "./combinatoric";

export const { make, isSpecimen, rangeWith, iterateBy, strict } = structureHelpersBy(
	CombinatoricStructureType.OneOf,
	(array: AnyArray) => ({
		type: CombinatoricStructureType.OneOf,
		array,
	})
);
export type Structure = CombinatoricStructureType.OneOf;
export type Node = CombinatoricStructure[Structure];
