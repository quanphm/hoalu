import type { PG_ENUM_WALLET_TYPE } from "@hoalu/common/enums";
import {
	BuildingIcon,
	WalletIcon as CashIcon,
	CreditCardIcon,
	LandmarkIcon,
} from "@hoalu/icons/lucide";

type WalletType = (typeof PG_ENUM_WALLET_TYPE)[number];

const components: Record<WalletType, React.ReactNode> = {
	cash: <CashIcon className="size-4 text-yellow-500" />,
	"bank-account": <BuildingIcon className="size-4 text-orange-500" />,
	"credit-card": <CreditCardIcon className="size-4 bg-transparent text-indigo-500 " />,
	"debit-card": <CreditCardIcon className="size-4 text-teal-500" />,
	"digital-account": <LandmarkIcon className="size-4 text-violet-500" />,
};

export function WalletIcon(props: { type: WalletType }) {
	if (!components[props.type]) {
		throw new Error("unknown wallet type");
	}
	return components[props.type];
}
