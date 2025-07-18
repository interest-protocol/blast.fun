'use client'

import { useEffect } from "react";
import { scan } from 'react-scan';

export function ReactScan() {
    if (process.env.NODE_ENV === "production") return null;

    useEffect(() => {
        scan({
            enabled: true
        });
    }, []);

    return <></>
}
