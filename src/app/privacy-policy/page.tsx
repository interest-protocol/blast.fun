import { FC } from "react";

import { Metadata } from "next";

import PrivacyPolicy from "@/views/privacy-policy";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "Privacy Policy for Blast Platform",
}

const PrivacyPolicyPage: FC = () => <PrivacyPolicy/>;

export default PrivacyPolicyPage;