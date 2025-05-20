"use client";

import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

type Props = {
	children?: ReactNode;
	style?: string;
};

const LogoutButton = ({ children, style }: Props) => {
	return (
		// biome-ignore lint: reason
		<div className={style} onClick={() => {signOut();}}>
			{children}
		</div>
	);
};

export default LogoutButton;
