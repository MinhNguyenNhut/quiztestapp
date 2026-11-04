import { useAppSelector } from '../features/store';

export const useAuthToken = () => useAppSelector((state) => state.auth.token) ?? '';