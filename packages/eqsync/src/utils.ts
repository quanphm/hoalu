// @see https://github.com/jonschlinkert/is-plain-object
// biome-ignore lint/complexity/noBannedTypes: bypass
function isPlainObject(o: any): o is Object {
	if (!hasObjectPrototype(o)) {
		return false;
	}

	// If has no constructor
	const ctor = o.constructor;
	if (ctor === undefined) {
		return true;
	}

	// If has modified prototype
	const prot = ctor.prototype;
	if (!hasObjectPrototype(prot)) {
		return false;
	}

	// If constructor does not have an Object-specific method
	// biome-ignore lint/suspicious/noPrototypeBuiltins: bypass
	if (!prot.hasOwnProperty("isPrototypeOf")) {
		return false;
	}

	// Handles Objects created by Object.create(<arbitrary prototype>)
	if (Object.getPrototypeOf(o) !== Object.prototype) {
		return false;
	}

	// Most likely a plain Object
	return true;
}

function hasObjectPrototype(o: any): boolean {
	return Object.prototype.toString.call(o) === "[object Object]";
}

function hashKey(queryKey: ReadonlyArray<unknown>): string {
	return JSON.stringify(queryKey, (_, val) =>
		isPlainObject(val)
			? Object.keys(val)
					.sort()
					.reduce((result, key) => {
						result[key] = val[key];
						return result;
					}, {} as any)
			: val,
	);
}

export { isPlainObject, hashKey };
