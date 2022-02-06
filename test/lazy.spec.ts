import { Lazy } from "../src/lazy";
describe("Lazy", () => {
	describe.each([
		{ type: "Array", makeLazy: Lazy.from },
		{ type: "Set", makeLazy: Lazy.set },
	])("$type variant", ({ makeLazy }) => {
		it("should be iterable", () => {
			const actual = [];
			const expected = ["foo"];
			for (const item of makeLazy(expected)) {
				actual.push(item);
			}
			expect(actual).toStrictEqual(expected);
		});

		it("should reflect usage of map after using collect", () => {
			const expected = ["FOO"];
			const actual = makeLazy(["foo"])
				.map((str) => str.toUpperCase())
				.collect();
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
			const actual = makeLazy(["foo", "bar"])
				.filter((str) => str === "bar")
				.collect();
			expect(actual).toStrictEqual(expected);
		});

		it("should allow correct usage of concat", () => {
			const expected = ["BAR", "BAZ", "foobar"];
			const actual = makeLazy(["foo", "bar"])
				.filter((str) => str === "bar")
				.concat(["baz"])
				.map((str) => str.toUpperCase())
				.concat(["foobar"])
				.collect();
			console.log(actual);
			expect(actual).toStrictEqual(expected);
		});

		it("should allow correct usage of flatten", () => {
			const actual = makeLazy([["foo", "bar"]])
				.map((arr) => arr.concat("baz"))
				.flatten()
				.filter((item) => item !== "foo")
				.collect();
			expect(actual).toStrictEqual(["bar", "baz"]);
		});

		it("should allow correct usage of flatMap", () => {
			const actual = makeLazy([["foo", "bar"]])
				.map((arr) => arr.concat("baz"))
				.flatMap((item) => item.map((str) => str.toUpperCase()))
				.filter((item) => item !== "FOO")
				.collect();
			expect(actual).toStrictEqual(["BAR", "BAZ"]);
		});

		it("should allow Lazy<T> or T[] to be used with `.from`", () => {
			const expected = ["foo"];
			const lazy = makeLazy(expected);
			const actual = makeLazy(lazy).collect();
			expect(actual).toStrictEqual(expected);
		});

		it("should allow correct usage of push", () => {
			const expected = ["foo", "bar"];
			const actual = makeLazy(["foo"]).push("bar").collect();
			expect(actual).toStrictEqual(expected);
		});
	});

	describe("Set variant", () => {
		it("should not contain duplicates that are comparable with SameValueZero equality", () => {
			const values = ["foo", "foo", "bar"];
			const expected = ["foo", "bar"];
			const actual = Lazy.set(values).collect();
			expect(actual).toStrictEqual(expected);
		});
		it("should not contain duplicates after pushing the same value", () => {
			const values = ["foo", "bar"];
			const expected = ["foo", "bar"];
			const actual = Lazy.set(values).push("foo").push("bar").collect();
			expect(actual).toStrictEqual(expected);
		});
	});
});
