import { Globe, Send } from "lucide-react";
import { BsTwitterX } from "react-icons/bs";

export const socialIcons = [
    { key: "twitter", icon: BsTwitterX, label: "X" },
    { key: "telegram", icon: Send, label: "TELEGRAM" },
    { key: "website", icon: Globe, label: "WEBSITE" },
] as const