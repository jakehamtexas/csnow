import { Cartesian } from "../src";

describe("Cartesian.calculate", () => {
	describe("object", () => {
		it("should calculate cartesian product with an object of two properties, each of Cartesian.oneOf", () => {
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

		it("should calculate cartesian product with an object of two properties, one of Cartesian.oneOf, and one of a string", () => {
			// arrange
			const object = {
				foo: Cartesian.oneOf(["bar", "baz"]),
				foo2: "bar2",
			};

			const expected = [
				{
					foo: "bar",
					foo2: "bar2",
				},
				{
					foo: "baz",
					foo2: "bar2",
				},
			];

			// act
			const actual = Cartesian.calculate(object);

			// assert
			expect(actual).toStrictEqual(expect.arrayContaining(expected));
		});

		it("should calculate cartesian product with an object of two properties, one of Cartesian.oneOf, and one of an array of string", () => {
			// arrange
			const object = {
				foo: Cartesian.oneOf(["bar", "baz"]),
				foo2: ["bar2", "baz2"],
			};

			const expected = [
				{
					foo: "bar",
					foo2: ["bar2", "baz2"],
				},
				{
					foo: "baz",
					foo2: ["bar2", "baz2"],
				},
			];

			// act
			const actual = Cartesian.calculate(object);

			// assert
			expect(actual).toStrictEqual(expect.arrayContaining(expected));
		});
	});
});
