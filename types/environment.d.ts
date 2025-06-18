declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DATABASE_URL: string;
			NEXTAUTH_SECRET: string;
			NEXT_PUBLIC_URL: string;
			VERIFICATION_URL: string;
			VERIFICATION_SUBJECT: string;
			AUTH_LOGIN_REDIRECT: string;
			OTP_SUBJECT: string;
			RESET_PASSWORD_URL: string;
			RESET_PASSWORD_SUBJECT: string;
			NEXT_APPLICATION_NAME:string
		}
	}
}
export type {};
