import { Lazy } from "../src/lazy";
describe("Lazy", () => {
	it("should be iterable", () => {
		const actual = [];
		const expected = ["foo"];
		for (const item of Lazy.from(expected)) {
			actual.push(item);
		}
		expect(actual).toStrictEqual(expected);
	});

	it("should reflect usage of map after using collect", () => {
		const expected = ["FOO"];
		const actual = Lazy.from(["foo"])
			.map((str) => str.toUpperCase())
			.collect();
		expect(actual).toStrictEqual(expected);
	});

	it(".each should be lazy/iterable", () => {
		const actual = Lazy.from(["foo", "foo"]).each((str) => {
			expect(str).toBe("foo");
		});
		expect.assertions(0);
		[...actual];
		expect.assertions(2);
	});

	it("should reflect usage of filter after using collect", () => {
		const expected = ["bar"];
		const actual = Lazy.from(["foo", "bar"])
			.filter((str) => str === "bar")
			.collect();
		expect(actual).toStrictEqual(expected);
	});

	it("should allow correct usage of concat", () => {
		const expected = ["BAR", "BAZ", "foobar"];
		const actual = Lazy.from(["foo", "bar"])
			.filter((str) => str === "bar")
			.concat(["baz"])
			.map((str) => {
				console.log(str);
				return str.toUpperCase();
			})
			.concat(["foobar"])
			.collect();
		expect(actual).toStrictEqual(expected);
	});

	it("should allow correct usage of flatten", () => {
		const actual = Lazy.from([["foo", "bar"]])
			.map((arr) => arr.concat("baz"))
			.flatten()
			.filter((item) => item !== "foo")
			.collect();
		expect(actual).toStrictEqual(["bar", "baz"]);
	});

	it("should allow correct usage of flatMap", () => {
		const actual = Lazy.from([["foo", "bar"]])
			.map((arr) => arr.concat("baz"))
			.flatMap((item) => item.map((str) => str.toUpperCase()))
			.filter((item) => item !== "FOO")
			.collect();
		expect(actual).toStrictEqual(["BAR", "BAZ"]);
	});

	it("should allow Lazy<T> or T[] to be used with `.from`", () => {
		const expected = ["foo"];
		const lazy = Lazy.from(expected);
		const actual = Lazy.from(lazy).collect();
		expect(actual).toStrictEqual(expected);
	});
});
