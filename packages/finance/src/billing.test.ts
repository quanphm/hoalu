import { describe, expect, test } from "bun:test";

import { projectBills, type BillDefinition, type Payment } from "./billing.ts";

function bill(overrides: Partial<BillDefinition> = {}): BillDefinition {
	return {
		id: "bill-1",
		repeat: "monthly",
		anchorDate: "2026-04-03",
		dueDay: 10,
		dueMonth: null,
		startsOn: "2026-04-03",
		...overrides,
	};
}

function payment(overrides: Partial<Payment> = {}): Payment {
	return {
		billId: "bill-1",
		expenseId: "expense-1",
		date: "2026-09-10",
		...overrides,
	};
}

function project(
	bills: BillDefinition[],
	payments: Payment[],
	today: string,
	options?: { lookbackDays?: number; horizonDays?: number },
) {
	return projectBills({ bills, payments, today }, options);
}

const periods = (occurrences: { period: string }[]) =>
	occurrences.map((occurrence) => occurrence.period);

describe("a payment stays attached to its period when the schedule moves", () => {
	test("'PQL A3': September stays settled after the due day moves 5 -> 10", () => {
		// The reported bug. Every payment was stamped under the *old* definition, so
		// the September one is dated 2026-09-05 while the schedule now yields 2026-09-10.
		const projection = project(
			[bill({ dueDay: 10 })],
			[
				payment({ expenseId: "apr", date: "2026-04-02" }),
				payment({ expenseId: "may", date: "2026-05-07" }),
				payment({ expenseId: "jun", date: "2026-06-03" }),
				payment({ expenseId: "jul", date: "2026-07-12" }),
				payment({ expenseId: "aug", date: "2026-08-09" }),
				payment({ expenseId: "sep", date: "2026-09-05" }),
			],
			"2026-10-10",
		);

		expect(projection.overdue).toHaveLength(0);
		expect(periods(projection.today)).toEqual(["2026-10"]);
		expect(projection.anomalies).toHaveLength(0);
	});

	test("a payment recorded a day after the due date still settles its month", () => {
		const projection = project(
			[bill({ dueDay: 10 })],
			[payment({ date: "2026-09-11" })],
			"2026-10-10",
		);

		expect(projection.overdue).toHaveLength(0);
	});

	test("every due day inside the month maps to the same period", () => {
		for (const dueDay of [1, 5, 10, 28, 30, 31]) {
			const projection = project(
				[bill({ dueDay })],
				[payment({ date: "2026-09-10" })],
				"2026-09-20",
			);
			expect(projection.overdue.some((occurrence) => occurrence.period === "2026-09")).toBe(false);
		}
	});

	test("an explicit period overrides the payment's own date", () => {
		const projection = project(
			[bill()],
			[payment({ date: "2026-10-03", period: "2026-09" })],
			"2026-10-05",
		);

		expect(projection.overdue).toHaveLength(0);
		expect(periods(projection.upcoming)).toEqual(["2026-10"]);
	});
});

describe("attribution", () => {
	test("a payment dated in the next month settles that month", () => {
		const projection = project([bill()], [payment({ date: "2026-10-03" })], "2026-10-05");

		// October settled; September is left outstanding — the documented semantics.
		// The "Log payment" flow avoids this by stamping the occurrence's own date.
		expect(periods(projection.overdue)).toEqual(["2026-09"]);
		expect(periods(projection.upcoming)).toEqual([]);
	});

	test("payments for periods outside the window are ignored", () => {
		const projection = project([bill()], [payment({ date: "2026-05-08" })], "2026-10-10");

		expect(projection.anomalies).toHaveLength(0);
	});
});

describe("repeats", () => {
	test("yearly treats the calendar year as the period", () => {
		const projection = project(
			[
				bill({
					repeat: "yearly",
					anchorDate: "2024-06-15",
					dueDay: 15,
					dueMonth: 6,
					startsOn: "2024-06-15",
				}),
			],
			[payment({ date: "2026-06-14" })],
			"2026-06-15",
		);

		expect(projection.overdue).toHaveLength(0);
		expect(periods(projection.upcoming)).toEqual(["2027"]);
	});

	test("weekly treats the ISO week as the period", () => {
		const projection = project(
			[bill({ repeat: "weekly", anchorDate: "2026-09-01", dueDay: 3, startsOn: "2026-09-01" })],
			[payment({ date: "2026-09-09" })],
			"2026-09-20",
		);

		// Sep 9 (a Wednesday) settles ISO week 37; weeks 36 and 38 remain.
		expect(projection.anomalies).toHaveLength(0);
		expect(periods(projection.overdue)).toEqual(["2026-W36", "2026-W38"]);
	});

	test("a one-time bill projects exactly one occurrence at its anchor", () => {
		const projection = project(
			[bill({ repeat: "one-time", anchorDate: "2026-10-05", startsOn: "2026-10-01" })],
			[],
			"2026-10-10",
		);

		expect(projection.unsupported).toHaveLength(0);
		expect(projection.overdue.map((o) => o.dueDate)).toEqual(["2026-10-05"]);
	});

	test("a one-time bill is settled by any in-window payment", () => {
		const projection = project(
			[bill({ repeat: "one-time", anchorDate: "2026-10-05", startsOn: "2026-10-01" })],
			[payment({ date: "2026-10-07" })],
			"2026-10-10",
		);

		expect(projection.overdue).toHaveLength(0);
	});

	test("an expired one-time bill projects nothing", () => {
		const projection = project(
			[bill({ repeat: "one-time", anchorDate: "2026-05-05", startsOn: "2026-05-01" })],
			[],
			"2026-10-10",
		);

		expect(projection.overdue).toHaveLength(0);
		expect(projection.today).toHaveLength(0);
		expect(projection.upcoming).toHaveLength(0);
	});

	test("custom repeat is reported as unsupported instead of silently vanishing", () => {
		const projection = project([bill({ repeat: "custom" })], [], "2026-10-10");

		expect(projection.unsupported).toEqual(["bill-1"]);
		expect(projection.upcoming).toHaveLength(0);
	});
});

describe("buckets", () => {
	test("splits by due date and reports daysUntil", () => {
		const projection = project([bill({ dueDay: 5 })], [], "2026-10-07", { lookbackDays: 40 });

		expect(projection.overdue.map((o) => o.dueDate)).toEqual(["2026-09-05", "2026-10-05"]);
		expect(projection.overdue[0]?.daysUntil).toBe(-32);
		expect(projection.overdue[0]?.bucket).toBe("overdue");
		expect(projection.upcoming.map((o) => o.dueDate)).toEqual(["2026-11-05"]);
	});

	test("an occurrence due today lands in its own bucket", () => {
		const projection = project([bill({ dueDay: 10 })], [], "2026-10-10");

		expect(projection.today.map((o) => o.dueDate)).toEqual(["2026-10-10"]);
		expect(projection.today[0]?.daysUntil).toBe(0);
	});

	test("a settled occurrence is not listed at all", () => {
		const projection = project(
			[bill({ dueDay: 10 })],
			[payment({ date: "2026-09-10" })],
			"2026-10-10",
		);

		expect(periods(projection.overdue)).toEqual([]);
		expect(periods(projection.today)).toEqual(["2026-10"]);
	});

	test("the lookback is clamped to the bill's start date", () => {
		const projection = project([bill({ startsOn: "2026-10-01" })], [], "2026-10-10", {
			lookbackDays: 90,
		});

		expect(projection.overdue).toHaveLength(0);
		expect(projection.today.map((o) => o.dueDate)).toEqual(["2026-10-10"]);
	});

	test("sorts deterministically by due date then bill id", () => {
		const projection = project(
			[bill({ id: "b", dueDay: 20 }), bill({ id: "a", dueDay: 20 })],
			[],
			"2026-10-01",
		);

		expect(projection.upcoming.map((o) => `${o.dueDate}:${o.billId}`)).toEqual([
			"2026-10-20:a",
			"2026-10-20:b",
		]);
	});
});

describe("anomalies", () => {
	test("flags a payment that matches no scheduled occurrence", () => {
		const projection = project(
			[bill({ dueDay: 10, startsOn: "2026-04-01" })],
			[payment({ date: "2026-09-20", period: "2026-08", expenseId: "orphan" })],
			"2026-10-10",
		);

		expect(projection.anomalies).toEqual([
			{
				kind: "unscheduled-payment",
				billId: "bill-1",
				period: "2026-08",
				expenseIds: ["orphan"],
			},
		]);
	});

	test("flags two payments against the same period", () => {
		const projection = project(
			[bill()],
			[
				payment({ expenseId: "e1", date: "2026-10-10" }),
				payment({ expenseId: "e2", date: "2026-10-11" }),
			],
			"2026-10-20",
		);

		expect(projection.anomalies).toEqual([
			{
				kind: "duplicate-payment",
				billId: "bill-1",
				period: "2026-10",
				expenseIds: ["e1", "e2"],
			},
		]);
	});
});

describe("totality", () => {
	test("reports a malformed bill and ignores payments for unknown bills", () => {
		const projection = project(
			[bill({ anchorDate: "not-a-date" })],
			[payment({ billId: "does-not-exist" })],
			"2026-10-10",
		);

		expect(projection.unsupported).toEqual(["bill-1"]);
		expect(projection.overdue).toHaveLength(0);
	});

	test("is deterministic and does not mutate its inputs", () => {
		const bills = [bill()];
		const payments = [payment()];

		expect(projectBills({ bills, payments, today: "2026-10-10" })).toEqual(
			projectBills({ bills, payments, today: "2026-10-10" }),
		);
		expect(bills).toHaveLength(1);
		expect(payments).toHaveLength(1);
	});
});
