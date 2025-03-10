import type { PG_ENUM_WALLET_TYPE } from "@hoalu/common/enums";
import {
	BuildingIcon,
	WalletIcon as CashIcon,
	CreditCardIcon,
	LandmarkIcon,
} from "@hoalu/icons/lucide";

type WalletType = (typeof PG_ENUM_WALLET_TYPE)[number];

const components: Record<WalletType, React.ReactNode> = {
	cash: (
		<div className="rounded-lg bg-amber-100 p-2.5">
			<CashIcon className="size-5 text-amber-600" />
		</div>
	),
	"bank-account": (
		<div className="rounded-lg bg-orange-100 p-2.5">
			<BuildingIcon className="size-5 text-orange-600" />
		</div>
	),
	"credit-card": (
		<div className="rounded-lg bg-blue-100 p-2.5">
			<CreditCardIcon className="size-5 text-blue-600" />
		</div>
	),
	"debit-card": (
		<div className="rounded-lg bg-teal-100 p-2.5">
			<CreditCardIcon className="size-5 text-teal-600" />
		</div>
	),
	"digital-account": (
		<div className="rounded-lg bg-violet-100 p-2.5">
			<LandmarkIcon className="size-5 text-violet-600" />
		</div>
	),
};

export function WalletIcon(props: { type: WalletType }) {
	if (!components[props.type]) {
		throw new Error("unknown wallet type");
	}
	return components[props.type];
}
