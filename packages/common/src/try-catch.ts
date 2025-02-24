type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type TryCatchResult<E = Error, T = unknown> = Success<T> | Failure<E>;

function tryCatchSync<E = Error, T = unknown>(fn: () => T): TryCatchResult<E, T> {
	try {
		const data = fn();
		return { data, error: null };
	} catch (error) {
		return { data: null, error: error as E };
	}
}

async function tryCatchAsync<E = Error, T = unknown>(
	promise: Promise<T>,
): Promise<TryCatchResult<E, T>> {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		return { data: null, error: error as E };
	}
}

export const tryCatch = {
	sync: tryCatchSync,
	async: tryCatchAsync,
};
