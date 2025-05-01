"use client";

import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

type Props = {
	children?: ReactNode;
};

const LogoutButton = ({ children }: Props) => {
	return (
		// biome-ignore lint: reason
		<div className=""
			onClick={async () => {
				await signOut();
			}}
		>
			{children}
		</div>
	);
};

export default LogoutButton;
