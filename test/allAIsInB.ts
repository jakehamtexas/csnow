export const allAisInB = (a: unknown[], b: unknown[]) => {
	a.forEach((aItem) => {
		expect(b).toContainEqual(aItem);
	});
};
