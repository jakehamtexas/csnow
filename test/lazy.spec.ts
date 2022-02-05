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
});
