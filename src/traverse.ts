import _ from "lodash";
import { ObjectKey } from "./lazy/abstract";
import hasType from "./lazy/hasType";

export type TerminalNode = string | number | boolean | null | undefined;
export type IterableNode = Iterable<unknown>;
export type NonTerminalNode = MapNode | IterableNode;
export type AnyNode = TerminalNode | NonTerminalNode;
export interface MapNode {
	[s: ObjectKey]: AnyNode;
}

export const isTerminalNode = (maybe: unknown): maybe is TerminalNode => !hasType.anyObject(maybe);
export const isMapNode = (maybe: unknown): maybe is MapNode => hasType.anyObject(maybe) && !hasType.anyArray(maybe);
export const isIterableNode = (maybe: unknown): maybe is IterableNode => [hasType.anyArray, hasType.anySet].some((fn) => fn(maybe));

export type RTraverseFn<TIterableHookRT, TMapHookRT> = (node: AnyNode) => TIterableHookRT | TMapHookRT | TerminalNode;
export type TraverseStrategy<TIterableHookRT extends AnyNode, TMapHookRT extends AnyNode> = {
	terminalHook?: (node: TerminalNode) => TerminalNode;
	rTraverseIterableBy: (traverse: RTraverseFn<TIterableHookRT, TMapHookRT>) => (node: IterableNode) => TIterableHookRT;
	rTraverseMapBy: (traverse: RTraverseFn<TIterableHookRT, TMapHookRT>) => (node: MapNode) => TMapHookRT;
};
export const traverseWith = <TIterableHookRT extends AnyNode, TMapHookRT extends AnyNode>({
	terminalHook = _.identity,
	rTraverseIterableBy,
	rTraverseMapBy,
}: TraverseStrategy<TIterableHookRT, TMapHookRT>) => {
	const rTraverseIterable = rTraverseIterableBy(rTraverse);
	const rTraverseMap = rTraverseMapBy(rTraverse);
	function rTraverse(node: AnyNode): TIterableHookRT | TMapHookRT | TerminalNode {
		if (isTerminalNode(node)) return terminalHook(node);
		if (isIterableNode(node)) return rTraverseIterable(node);
		if (isMapNode(node)) return rTraverseMap(node);
		throw new Error("Unreachable!");
	}
	return { rTraverse, rTraverseIterable, rTraverseMap };
};
