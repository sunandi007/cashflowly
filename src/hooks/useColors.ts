import { useTheme } from '@/contexts/ThemeContext';

/**
 * Hook untuk mendapatkan colors yang sesuai dengan theme aktif
 * Gunakan ini daripada import { colors } from '@/constant/theme'
 */
export function useColors() {
    const { colors } = useTheme();
    return colors;
}
