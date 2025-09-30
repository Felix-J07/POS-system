// Checks if the app is running in development mode
export function isDev(): boolean {
    return process.env.NODE_ENV === 'development';
}