import fastCartesian from "fast-cartesian";
import { CombinatoricStructureUnion } from "./combinatoric/combinatoric";
import { toExpanded } from "./graph";
import { AnyArray } from "./util";

// type Cartesian = {};
// type Snap<TInput extends Cartesian, TOutput> = (input: TInput, fn: (input: TInput) => TOutput) => SnapTest<TInput, TOutput>;
type Irreducible = string | number | symbol | null | undefined | boolean;
type SubjectValue = CombinatoricStructureUnion | object | Irreducible | AnyArray;

type Subject = Record<string, SubjectValue>;
export function calculate(subject: AnyArray[] | (AnyArray | unknown)[]): object[];
export function calculate(firstArg: Subject, ...otherArgs: Subject[]): object[];
export function calculate(firstArg: Subject | AnyArray[] | (AnyArray | unknown)[], ...otherArgs: Subject[]) {
	if (Array.isArray(firstArg)) return fastCartesian(firstArg.map((v) => (Array.isArray(v) ? v : [v])) as unknown[][]);

	const subjects = [firstArg, ...otherArgs];
	return toExpanded(subjects);
}

type NormalizedFormSubjectNode<TSubject, K extends keyof TSubject> = TSubject[K] extends infer V
	? V extends Irreducible
		? V
		: V extends CombinatoricStructureUnion
		? NormalizedFormSubjectNode<V["array"], number>
		: V extends unknown[]
		? NormalizedFormSubjectNode<V, number>[]
		: V extends object
		? NormalizedFormSubject<V>
		: never
	: never;
type NormalizedFormSubject<TSubject extends object> = TSubject extends infer X
	? {
			[K in keyof X]: X extends infer U ? (K extends keyof U ? NormalizedFormSubjectNode<U, K> : never) : never;
	  }
	: never;

export type Snapshot<TSubject extends Subject, TOutput> = {
	input: NormalizedFormSubject<TSubject>[];
	output: TOutput;
}[];

export const makeSnapshot = <TSubject extends Subject, TOutput>(
	subjects: TSubject[],
	fn: (...subjects: NormalizedFormSubject<TSubject>[]) => TOutput
): Snapshot<TSubject, TOutput> => {
	const expansions = toExpanded(subjects);
	return expansions.map((input) => ({
		input: input as NormalizedFormSubject<TSubject>[],
		output: fn(...(input as NormalizedFormSubject<TSubject>[])),
	}));
};
