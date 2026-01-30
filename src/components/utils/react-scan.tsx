"use client";

import { FC, useEffect } from "react";
import { scan } from "react-scan";

const ReactScan: FC = () => {
    useEffect(() => {
        scan({
            enabled: process.env.NODE_ENV === "development",
        });
    }, []);

    return null;
}

export default ReactScan;
