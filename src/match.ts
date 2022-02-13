export type MatchPredicateWithType<T = never, U extends T = never> = (v: T) => v is U;
export type MatchAction<T, U> = (v: T) => U;

export type CaseResolver<U> = (norm: unknown) => { skip: false; getResult: () => U } | { skip: true };
export const makeCase =
	<
		TNorm,
		UReturn,
		TPredicate extends (v: unknown) => boolean,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		TInput = TPredicate extends MatchPredicateWithType<infer _T2, infer U2> ? U2 : TNorm
	>(
		predicate: TPredicate,
		action: MatchAction<TInput, UReturn>
	): CaseResolver<UReturn> =>
	(norm) =>
		predicate(norm) ? { skip: false, getResult: () => action(norm as never) } : { skip: true };

export type Matcher<T, U> = {
	cases: CaseResolver<U>[];
	wildcard?: MatchAction<T, U>;
};
export type MatchFnBy = <T>(v: T) => <U>(matcher: Matcher<T, U>) => U;
export const matchBy: MatchFnBy =
	(v) =>
	({
		cases,
		wildcard = () => {
			throw new Error("Wildcard reached, but not specified.");
		},
	}) => {
		const resolved = cases.map((resolver) => resolver(v)).find((resolved) => !resolved.skip);
		return resolved && !resolved.skip ? resolved.getResult() : wildcard(v);
	};
