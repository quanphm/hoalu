type TryCatchResult<E = Error, T = unknown> = [null, T] | [E, null];

export async function tryCatchAsync<E = Error, T = unknown>(
	promise: Promise<T>,
): Promise<TryCatchResult<E, T>> {
	try {
		const data = await promise;
		return [null, data];
	} catch (error) {
		return [error as E, null];
	}
}
