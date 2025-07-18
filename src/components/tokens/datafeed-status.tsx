'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

type ServiceStatus = 'checking' | 'online' | 'offline' | 'error'

export function DatafeedStatus() {
    const [status, setStatus] = useState<ServiceStatus>('checking')
    
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch(
                    'https://datafeed-rest-production.up.railway.app/api/v1/datafeed/symbols?limit=1',
                    { 
                        method: 'HEAD',
                        signal: AbortSignal.timeout(5000)
                    }
                )
                
                if (response.ok) {
                    setStatus('online')
                } else if (response.status === 500 || response.status === 503) {
                    setStatus('offline')
                } else {
                    setStatus('error')
                }
            } catch (error) {
                setStatus('error')
            }
        }
        
        checkStatus()
        const interval = setInterval(checkStatus, 60000) // Check every minute
        
        return () => clearInterval(interval)
    }, [])
    
    if (status === 'checking' || status === 'online') {
        return null
    }
    
    return (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="font-mono text-xs uppercase">
                DATAFEED::SERVICE_UNAVAILABLE - CHARTS::TEMPORARILY_DISABLED
            </AlertDescription>
        </Alert>
    )
}