import { IAnyLazy, Lazy } from "../src/lazy";

type MakeArray = typeof Lazy.array & typeof Lazy.object & typeof Lazy.set;
describe("Lazy", () => {
	const describeObjectTest = "Object variant";
	const describeArrayTest = "Array variant";
	const describeSetTest = "Set variant";

	const getCollectedArray = <T>(lazy: IAnyLazy<T>) => {
		const collected = lazy.collect() as Set<T> | T[] | Record<string, T>;
		return collected instanceof Set ? [...collected] : collected instanceof Array ? collected : Object.values(collected);
	};

	describe.each([
		{ type: describeObjectTest, fn: Lazy.object },
		{ type: describeArrayTest, fn: Lazy.array },
		{ type: describeSetTest, fn: Lazy.set },
	])("$type", ({ fn }) => {
		const makeLazy = fn as MakeArray;
		it("should be iterable", () => {
			const actual = [];
			const expected = ["foo"];
			for (const item of makeLazy(expected).iterators.values()) {
				actual.push(item);
			}
			expect(actual).toStrictEqual(expected);
		});

		it("should reflect usage of map after using collect", () => {
			const expected = ["FOO"];
			const actual = getCollectedArray(makeLazy(["foo"]).map((str) => str.toUpperCase()));
			expect(actual).toStrictEqual(expected);
		});

		it(".each should be lazy/iterable", () => {
			const arr = ["foo", "bar"];
			const actual = makeLazy(arr).each((str) => {
				expect(arr).toContain(str);
			});
			expect.assertions(0);
			[...actual];
			expect.assertions(2);
		});

		it("should reflect usage of filter after using collect", () => {
			const expected = ["bar"];
			const actual = getCollectedArray(makeLazy(["foo", "bar"]).filter((str) => str === "bar"));
			expect(actual).toStrictEqual(expected);
		});
	});

	describe.each([
		{ type: describeArrayTest, fn: Lazy.array },
		{ type: describeSetTest, fn: Lazy.set },
	])("$type", ({ fn }) => {
		const makeLazy = fn as MakeArray;
		it("should allow correct usage of concat", () => {
			const expected = ["BAR", "BAZ", "foobar"];
			const actual = getCollectedArray(
				makeLazy(["foo", "bar"])
					.filter((str) => str === "bar")
					.concat(["baz"])
					.map((str) => str.toUpperCase())
					.concat(["foobar"])
			);
			expect(Object.values(actual)).toStrictEqual(expected);
		});

		it("should allow correct usage of append", () => {
			const expected = ["foo", "bar"];
			const actual = getCollectedArray(makeLazy(["foo"]).append("bar"));
			expect(Object.values(actual)).toStrictEqual(expected);
		});

		it("should allow correct usage of flatten", () => {
			const actual = getCollectedArray(
				makeLazy([["foo", "bar"]])
					.map((arr) => arr.concat("baz"))
					.flatten()
					.filter((item) => item !== "foo")
			);
			expect(actual).toStrictEqual(["bar", "baz"]);
		});

		it("should allow correct usage of flatMap", () => {
			const actual = getCollectedArray(
				makeLazy([["foo", "bar"]])
					.map((arr) => arr.concat("baz"))
					.flatMap((item) => item.map((str) => str.toUpperCase()))
					.filter((item) => item !== "FOO")
			);
			expect(Object.values(actual)).toStrictEqual(["BAR", "BAZ"]);
		});
	});

	describe(describeArrayTest, () => {
		describe("should allow indices to be used in callbacks", () => {
			it(".flatMap", () => {
				Lazy.array([["foo"]])
					.flatMap((_, index) => {
						expect(index).toBe(0);
					})
					.collect();
			});
		});
	});

	describe(describeSetTest, () => {
		it("should not contain duplicates that are comparable with SameValueZero equality", () => {
			const values = ["foo", "foo", "bar"];
			const expected = new Set(["foo", "bar"]);
			const actual = Lazy.set(values).collect();
			expect(actual).toStrictEqual(expected);
		});
		it("should not contain duplicates after appending the same value", () => {
			const values = ["foo", "bar"];
			const expected = new Set(["foo", "bar"]);
			const actual = Lazy.set(values).append("foo").append("bar").collect();
			expect(actual).toStrictEqual(expected);
		});
	});

	describe(describeObjectTest, () => {
		describe("should allow property keys to be used in callbacks", () => {
			it(".map", () => {
				Lazy.object({ foo: "bar" })
					.map((_, index) => {
						expect(index).toBe("foo");
					})
					.collect();
			});
			it(".filter", () => {
				Lazy.object({ foo: "bar" })
					.filter((_, index) => {
						expect(index).toBe("foo");
						return false;
					})
					.collect();
			});
			it(".each", () => {
				[
					...Lazy.object({ foo: "bar" }).each((_, index) => {
						expect(index).toBe("foo");
						return false;
					}),
				];
			});
		});

		it("should not allow properties to be added with the same key", () => {
			const expected = { foo: "baz" };
			const actual = Lazy.object({ foo: "bar" }).merge(expected).collect();
			expect(actual).toStrictEqual(expected);
		});

		it("should allow correct usage of merge", () => {
			const expected = { foo: "bar", bar: "baz" };
			const actual = Lazy.object({ foo: "bar" }).merge({ bar: "baz" }).collect();
			expect(actual).toStrictEqual(expected);
		});
	});

	describe.each([
		{
			type: describeObjectTest,
			fn: Lazy.object,
		},
		{
			type: describeArrayTest,
			fn: Lazy.array,
		},
	])("$type", ({ fn }) => {
		const makeLazy = fn as MakeArray;
		describe("should allow indices to be used in callbacks", () => {
			it(".map", () => {
				makeLazy(["bar"])
					.map((_, index) => {
						expect(index).toBe(0);
						return index;
					})
					.map((_, index) => {
						expect(index).toBe(0);
						return index;
					})
					.collect();
			});
			it(".filter", () => {
				makeLazy(["bar"])
					.map((_, index) => {
						expect(index).toBe(0);
						return index;
					})
					.filter((_, index) => {
						expect(index).toBe(0);
						return false;
					})
					.collect();
			});
			it(".each", () => {
				[
					...makeLazy(["bar"]).each((_, index) => {
						expect(index).toBe(0);
						return false;
					}),
				];
			});
		});
	});
});
