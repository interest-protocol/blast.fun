export interface TwitterUser {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
}

export interface TwitterAuthState {
    user: TwitterUser | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    error: string | null;
}
