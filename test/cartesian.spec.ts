import { Cartesian } from "../src";

describe("cartesian", () => {
	it("should calculate cartesian product", () => {
		// arrange
		const object = {
			foo: Cartesian.oneOf(["bar", "baz"]),
			foo2: Cartesian.oneOf(["bar2", "baz2"]),
		};

		const expected = [
			{
				foo: "bar",
				foo2: "bar2",
			},
			{
				foo: "bar",
				foo2: "baz2",
			},
			{
				foo: "baz",
				foo2: "bar2",
			},
			{
				foo: "baz",
				foo2: "baz2",
			},
		];

		// act
		const actual = Cartesian.calculate(object);

		// assert
		expect(actual).toStrictEqual(expect.arrayContaining(expected));
	});
});
