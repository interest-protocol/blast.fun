import { FC } from "react";
import { Metadata } from "next";

import TermsOfService from "@/views/term-of-service";

export const metadata: Metadata = {
	title: "Terms of Service",
	description: "Terms of Service for Blast Platform",
}

const TermsOfServicePage: FC = () => <TermsOfService/>;

export default TermsOfServicePage;