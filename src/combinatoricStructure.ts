import { AnyArray } from "./util";

export enum CombinatoricStructure {
	OneOf = "oneOf",
	KOf = "kOf",
}

const isPropertyKindBy =
	<TStructure extends CombinatoricStructure>(kind: TStructure) =>
	(v: unknown): v is Extract<CombinatoricStructuresUnion, { type: TStructure }> =>
		typeof v === "object" && (v as { type: CombinatoricStructure } | null)?.["type"] === kind;
export const isOneOf = isPropertyKindBy(CombinatoricStructure.OneOf);
export const isKOf = isPropertyKindBy(CombinatoricStructure.KOf);
type PropertyKindBase<TKind extends CombinatoricStructure> = { type: TKind; array: AnyArray };

export type OneOf = PropertyKindBase<CombinatoricStructure.OneOf>;
export type KOf = PropertyKindBase<CombinatoricStructure.KOf> & { k: number };

export type CombinatoricStructuresUnion = OneOf | KOf;
const arrayPropertyOf =
	<TPropertyKind extends CombinatoricStructure>(kind: TPropertyKind) =>
	(array: AnyArray): PropertyKindBase<TPropertyKind> => ({
		type: kind,
		array,
	});

export const oneOf = arrayPropertyOf(CombinatoricStructure.OneOf);
export const kOf = (k: number, array: AnyArray) => ({ ...arrayPropertyOf(CombinatoricStructure.KOf)(array), k });
