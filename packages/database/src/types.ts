import type { ColumnType } from "kysely";

interface Timestamp {
	created_at: ColumnType<Date, string | undefined, never>;
	updated_at: ColumnType<Date, string | undefined, string | undefined>;
}

export interface UserTable extends Timestamp {
	id: string;
	email: string;
	username: string;
}

export interface Database {
	user: UserTable;
}
