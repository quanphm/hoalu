import type { PG_ENUM_WALLET_TYPE } from "@hoalu/common/enums";
import {
	BuildingIcon,
	WalletIcon as CashIcon,
	CreditCardIcon,
	LandmarkIcon,
} from "@hoalu/icons/lucide";

type WalletType = (typeof PG_ENUM_WALLET_TYPE)[number];

const components: Record<WalletType, React.ReactNode> = {
	cash: <CashIcon className="size-5 text-amber-600" />,
	"bank-account": <BuildingIcon className="size-5 text-orange-600" />,
	"credit-card": <CreditCardIcon className="size-5 text-blue-600" />,
	"debit-card": <CreditCardIcon className="size-5 text-teal-600" />,
	"digital-account": <LandmarkIcon className="size-5 text-violet-600" />,
};

export function WalletIcon(props: { type: WalletType }) {
	if (!components[props.type]) {
		throw new Error("unknown wallet type");
	}
	return components[props.type];
}
