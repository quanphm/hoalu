import { db, schema } from "#api/db/index.ts";
import { createHonoInstance } from "#api/lib/create-app.ts";
import { parseExpense } from "#api/lib/parse-with-ai.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { CategoryRepository } from "#api/routes/categories/repository.ts";
import { ExpenseRepository } from "#api/routes/expenses/repository.ts";
import {
	DeleteExpenseSchema,
	ExpenseSchema,
	ExpensesSchema,
	InsertExpenseSchema,
	LiteExpenseSchema,
	QuickEntryParseSchema,
	QuickEntryResultSchema,
	UpdateExpenseSchema,
} from "#api/routes/expenses/schema.ts";
import { WalletRepository } from "#api/routes/wallets/repository.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { jsonBodyValidator } from "#api/validators/json-body.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";
import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { monetary } from "@hoalu/common/monetary";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { tryCatch } from "@hoalu/common/try-catch";
import { OpenAPI } from "@hoalu/furnace";
import { and, eq, sql } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import * as z from "zod";

const app = createHonoInstance();
const expenseRepository = new ExpenseRepository();
const categoryRepository = new CategoryRepository();
const walletRepository = new WalletRepository();
const TAGS = ["Expenses"];

const route = app
	.get(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Get all expenses",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: ExpensesSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const expenses = await expenseRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});

			const parsed = ExpensesSchema.safeParse(expenses);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Get a single expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: ExpenseSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const expense = await expenseRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!expense) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const parsed = ExpenseSchema.safeParse(expense);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Create a new expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteExpenseSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(InsertExpenseSchema),
		async (c) => {
			const user = c.get("user");
			if (!user) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: HTTPStatus.phrases.UNAUTHORIZED,
				});
			}
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			const { amount, currency, date, recurringBillId, ...rest } = payload;
			const realAmount = monetary.toRealAmount(amount, currency);
			const expenseDate = date || new Date().toISOString();
			const newAnchorDate = expenseDate.slice(0, 10); // "yyyy-MM-dd"

			const { expense, txid } = await db.transaction(async (tx) => {
				let bill: typeof schema.recurringBill.$inferSelect | null = null;

				// If a recurringBillId is provided (Log payment flow), fetch bill details
				// and advance anchor_date only for yearly bills — monthly/weekly due dates are fixed
				if (recurringBillId) {
					[bill] = await tx
						.select()
						.from(schema.recurringBill)
						.where(
							and(
								eq(schema.recurringBill.id, recurringBillId),
								eq(schema.recurringBill.workspaceId, workspace.id),
							),
						)
						.limit(1);

					if (bill && bill.repeat === "yearly") {
						await tx
							.update(schema.recurringBill)
							.set({ anchorDate: newAnchorDate, updatedAt: sql`now()` })
							.where(eq(schema.recurringBill.id, recurringBillId));
					}
				}

				const result = await tryCatch.async(
					tx
						.insert(schema.expense)
						.values({
							...rest,
							id: generateId({ use: "uuid" }),
							publicId: generateId({ use: "nanoid", kind: "expense" }),
							workspaceId: workspace.id,
							creatorId: user.id,
							date: expenseDate,
							amount: `${realAmount}`,
							currency,
							recurringBillId: recurringBillId ?? null,
						})
						.returning(),
				);

				if (result.error) {
					return { expense: null, txid: 0 };
				}

				const [expense] = result.data;

				// Track occurrence payment for recurring bills
				if (recurringBillId && bill) {
					// Calculate the correct due date based on bill's schedule
					// Parse expense date as local date to avoid UTC offset issues
					const expenseDateLocal = expenseDate.slice(0, 10); // "YYYY-MM-DD"
					const [year, month, day] = expenseDateLocal.split("-").map(Number);
					let dueDateStr: string;

					if (bill.repeat === "monthly" && bill.dueDay) {
						// For monthly bills, use the due_day from the expense's month
						dueDateStr = `${year}-${String(month).padStart(2, "0")}-${String(bill.dueDay).padStart(2, "0")}`;
					} else if (bill.repeat === "weekly" && bill.dueDay !== null) {
						// For weekly bills, find the nearest occurrence of the due day
						const expenseDateObj = new Date(year, month - 1, day);
						const expenseDayOfWeek = expenseDateObj.getDay();
						const targetDayOfWeek = bill.dueDay;
						const daysDiff = (targetDayOfWeek - expenseDayOfWeek + 7) % 7;
						const dueDate = new Date(year, month - 1, day + daysDiff);
						dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;
					} else if (bill.repeat === "yearly") {
						// For yearly bills, use the anchor_date month/day
						const anchorDate = new Date(bill.anchorDate);
						const dueMonth = bill.dueMonth ?? anchorDate.getMonth() + 1;
						const dueDay = bill.dueDay ?? anchorDate.getDate();
						dueDateStr = `${year}-${String(dueMonth).padStart(2, "0")}-${String(dueDay).padStart(2, "0")}`;
					} else {
						// For daily or other cases, use the expense date
						dueDateStr = expenseDateLocal;
					}

					// Try to find existing occurrence for this bill + due date
					const [existingOccurrence] = await tx
						.select()
						.from(schema.recurringBillOccurrence)
						.where(
							and(
								eq(schema.recurringBillOccurrence.recurringBillId, recurringBillId),
								eq(schema.recurringBillOccurrence.dueDate, dueDateStr),
							),
						)
						.limit(1);

					if (existingOccurrence) {
						// Update existing occurrence as paid
						await tx
							.update(schema.recurringBillOccurrence)
							.set({
								expenseId: expense.id,
								paidAt: sql`now()`,
								updatedAt: sql`now()`,
							})
							.where(eq(schema.recurringBillOccurrence.id, existingOccurrence.id));
					} else {
						// Create new occurrence record marked as paid
						await tx.insert(schema.recurringBillOccurrence).values({
							id: generateId({ use: "uuid" }),
							recurringBillId,
							dueDate: dueDateStr,
							expenseId: expense.id,
							paidAt: sql`now()`,
						});
					}
				}

				const txidResult = await tx.execute<{ txid: number }>(
					sql`SELECT txid_current()::bigint AS txid`,
				);

				const txid = txidResult.rows[0]?.txid ?? 0;

				return { expense, txid };
			});

			if (!expense) {
				return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteExpenseSchema.safeParse({ ...expense, txid });
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.CREATED);
		},
	)
	.patch(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Update a expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteExpenseSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(UpdateExpenseSchema),
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			const expense = await expenseRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!expense) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const {
				amount,
				currency,
				date,
				repeat,
				title,
				description,
				walletId,
				categoryId,
				recurringBillId: explicitRecurringBillId,
			} = payload;
			const resolvedCurrency = currency ?? expense.currency;
			const realAmount =
				amount !== undefined ? monetary.toRealAmount(amount, resolvedCurrency) : expense.amount;

			const user = c.get("user");
			if (!user) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: HTTPStatus.phrases.UNAUTHORIZED,
				});
			}

			// If the caller explicitly provided recurringBillId (link/unlink), skip all
			// automatic bill management and just use the explicit value.
			const explicitBillOverride = !!payload.recurringBillId;

			const { expense: updatedExpense, txid } = await db.transaction(async (tx) => {
				let resolvedRecurringBillId: string | null | undefined = expense.recurringBillId ?? null;

				if (explicitBillOverride) {
					// Caller is explicitly setting the link — trust it, no side effects
					resolvedRecurringBillId = explicitRecurringBillId ?? null;
				} else if (repeat !== undefined) {
					// repeat is explicitly being changed — manage the linked bill accordingly
					const newRepeat = repeat;
					const becomesOneOff = newRepeat === "one-time" || newRepeat === "custom";

					if (expense.recurringBillId) {
						if (becomesOneOff) {
							// Unlink and archive the existing bill
							await tx
								.update(schema.recurringBill)
								.set({ isActive: false, updatedAt: sql`now()` })
								.where(eq(schema.recurringBill.id, expense.recurringBillId));
							resolvedRecurringBillId = null;
						} else {
							// Sync the existing bill's metadata — anchorDate is NOT touched here;
							// it only advances when a new payment is logged (POST with recurringBillId).
							await tx
								.update(schema.recurringBill)
								.set({
									...(title !== undefined && { title }),
									...(description !== undefined && { description }),
									...(walletId !== undefined && { walletId }),
									...(categoryId !== undefined && { categoryId }),
									amount: `${realAmount}`,
									currency: resolvedCurrency,
									repeat: newRepeat,
									updatedAt: sql`now()`,
								})
								.where(eq(schema.recurringBill.id, expense.recurringBillId));
						}
					} else if (!becomesOneOff) {
						// No existing bill and repeat is now recurring — do NOT auto-create here.
						// The UI shows the "Set up recurring bill" prompt; let the user do it explicitly.
					}
				} else if (expense.recurringBillId) {
					// No repeat change, no explicit override — sync mutable fields on existing bill.
					// anchorDate is NOT touched here; it only advances when a new payment is logged.
					await tx
						.update(schema.recurringBill)
						.set({
							...(title !== undefined && { title }),
							...(description !== undefined && { description }),
							...(walletId !== undefined && { walletId }),
							...(categoryId !== undefined && { categoryId }),
							...(amount !== undefined && { amount: `${realAmount}` }),
							...(currency !== undefined && { currency: resolvedCurrency }),
							updatedAt: sql`now()`,
						})
						.where(eq(schema.recurringBill.id, expense.recurringBillId));
				}

				// Build the expense update — only include fields that were explicitly provided.
				// Never spread all of payload to avoid Zod-defaulted fields overwriting DB values.
				const expenseSet: Record<string, unknown> = {
					amount: `${realAmount}`,
					currency: resolvedCurrency,
					recurringBillId: resolvedRecurringBillId ?? null,
					updatedAt: sql`now()`,
				};
				if (title !== undefined) expenseSet.title = title;
				if (description !== undefined) expenseSet.description = description;
				if (repeat !== undefined) expenseSet.repeat = repeat;
				if (date !== undefined) expenseSet.date = date;
				if (walletId !== undefined) expenseSet.walletId = walletId;
				if (categoryId !== undefined) expenseSet.categoryId = categoryId;
				if (payload.eventId !== undefined) expenseSet.eventId = payload.eventId;

				const result = await tryCatch.async(
					tx
						.update(schema.expense)
						.set(expenseSet)
						.where(
							and(eq(schema.expense.id, param.id), eq(schema.expense.workspaceId, workspace.id)),
						)
						.returning(),
				);

				if (result.error) {
					return { expense: null, txid: 0 };
				}

				const [updated] = result.data;

				const txidResult = await tx.execute<{ txid: number }>(
					sql`SELECT txid_current()::bigint AS txid`,
				);
				const txid = txidResult.rows[0]?.txid ?? 0;

				return { expense: updated ?? null, txid };
			});

			if (!updatedExpense) {
				return c.json({ message: "Update failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteExpenseSchema.safeParse({ ...updatedExpense, txid });
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.delete(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Delete a expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: DeleteExpenseSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const { expense, txid } = await db.transaction(async (tx) => {
				const result = await tryCatch.async(
					tx
						.delete(schema.expense)
						.where(
							and(eq(schema.expense.id, param.id), eq(schema.expense.workspaceId, workspace.id)),
						)
						.returning(),
				);

				if (result.error) {
					return { expense: null, txid: 0 };
				}

				const [expense] = result.data;

				const txidResult = await tx.execute<{ txid: number }>(
					sql`SELECT txid_current()::bigint AS txid`,
				);
				const txid = txidResult.rows[0]?.txid ?? 0;

				return { expense: expense ?? null, txid };
			});

			const parsed = DeleteExpenseSchema.safeParse({ ...expense, txid });
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/parse-quick-entry",
		describeRoute({
			tags: TAGS,
			summary: "Parse quick entry text",
			description: "Parse natural language expense description into structured data using AI",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.response(z.object({ data: QuickEntryResultSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(QuickEntryParseSchema),
		async (c) => {
			const workspace = c.get("workspace");
			const { text } = c.req.valid("json");

			const [categories, wallets] = await Promise.all([
				categoryRepository.findAllByWorkspaceId({
					workspaceId: workspace.id,
				}),
				walletRepository.findAllByWorkspaceId({
					workspaceId: workspace.id,
				}),
			]);

			const today = new Date().toISOString().split("T")[0];
			const workspaceCurrency = workspace.metadata?.currency;

			const parsed = await parseExpense(
				text,
				categories.map((cat) => ({ id: cat.id, name: cat.name })),
				wallets.map((wallet) => ({ id: wallet.id, name: wallet.name })),
				{
					today,
					availableCurrencies: [workspaceCurrency, "USD", "EUR", "SGD"],
				},
			);

			if (!parsed) {
				throw new HTTPException(HTTPStatus.codes.BAD_REQUEST, {
					message: "Could not parse expense description",
				});
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	);

export default route;
