'use client';

import { createContext, useContext, useReducer, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { TwitterUser, TwitterAuthState } from '@/types/twitter';

type TwitterAuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_USER'; payload: TwitterUser | null }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET' };

interface TwitterAuthContextType extends TwitterAuthState {
    login: () => Promise<void>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

const initialState: TwitterAuthState = {
    user: null,
    isLoading: false,
    isLoggedIn: false,
    error: null,
};

const TwitterAuthContext = createContext<TwitterAuthContextType | undefined>(undefined);

function twitterAuthReducer(state: TwitterAuthState, action: TwitterAuthAction): TwitterAuthState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload, error: null };
        case 'SET_USER':
            return { ...state, user: action.payload, isLoading: false, isLoggedIn: !!action.payload, error: null };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

export function TwitterAuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(twitterAuthReducer, initialState);

    const login = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const response = await fetch('/api/auth/twitter/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Failed to get authorization URL');
            }

            const { authUrl } = await response.json();
            window.location.href = authUrl;
        } catch (error) {
            dispatch({
                type: 'SET_ERROR',
                payload: error instanceof Error ? error.message : 'Login failed'
            });
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            await fetch('/api/auth/twitter/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            dispatch({ type: 'SET_USER', payload: null });
        } catch (error) {
            dispatch({
                type: 'SET_ERROR',
                payload: error instanceof Error ? error.message : 'Logout failed'
            });
        }
    }, []);

    const checkAuthStatus = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const response = await fetch('/api/auth/twitter/me', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const user = await response.json();
                dispatch({ type: 'SET_USER', payload: user });
            } else {
                dispatch({ type: 'SET_USER', payload: null });
            }
        } catch (error) {
            dispatch({
                type: 'SET_ERROR',
                payload: error instanceof Error ? error.message : 'Auth check failed'
            });
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus])

    const contextValue = useMemo(() => ({
        ...state,
        login,
        logout,
        checkAuthStatus,
    }), [state, login, logout, checkAuthStatus]);

    return (
        <TwitterAuthContext.Provider value={contextValue}>
            {children}
        </TwitterAuthContext.Provider>
    );
}

export function useTwitter() {
    const context = useContext(TwitterAuthContext);
    if (context === undefined) {
        throw new Error('useTwitterAuth must be used within a TwitterAuthProvider');
    }

    return context;
}