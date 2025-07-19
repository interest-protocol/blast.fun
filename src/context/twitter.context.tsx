'use client';

import { createContext, useContext, useReducer, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export interface TwitterUser {
    id: string;
    username: string;
    name: string | null;
    profile_image_url: string | null;
}

interface TwitterAuthState {
    user: TwitterUser | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    error: string | null;
}

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
    const { data: session, status } = useSession();

    const login = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await signIn('twitter');
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
            await signOut({ redirect: true, callbackUrl: '/' });
        } catch (error) {
            dispatch({
                type: 'SET_ERROR',
                payload: error instanceof Error ? error.message : 'Logout failed'
            });
        }
    }, []);

    const checkAuthStatus = useCallback(async () => {
        // NextAuth handles this automatically via useSession
        // We'll update state based on session data in useEffect
    }, []);

    useEffect(() => {
        if (status === 'loading') {
            dispatch({ type: 'SET_LOADING', payload: true });
        } else if (status === 'authenticated' && session?.user) {
            const user: TwitterUser = {
                id: session.user.twitterId || '',
                username: session.user.username || '',
                name: session.user.name || '',
                profile_image_url: session.user.image || null,
            };
            dispatch({ type: 'SET_USER', payload: user });
        } else {
            dispatch({ type: 'SET_USER', payload: null });
        }
    }, [session, status])

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