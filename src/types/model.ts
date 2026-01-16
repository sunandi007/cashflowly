import { ReactNode } from "react";
import {
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
  StyleProp,
} from "react-native";

/* ===========================================
 * WRAPPER COMPONENT TYPES
 * ===========================================
 */
export type ScreenWrapperProps = {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export type ModalWrapperProps = {
  style?: StyleProp<ViewStyle>;
  bg?: string;
  children: ReactNode;
};

/* ===========================================
 * UI COMPONENT TYPES
 * ===========================================
 */
export type TypoProps = {
  size?: number;
  color?: string;
  fontWeight?: TextStyle["fontWeight"];
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  textProps?: TextProps;
};

export type HeaderProps = {
  title?: string;
  titleSize?: number;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  leftIcon?: ReactNode; // Legacy, kept for backward compat if needed, but prefer leftComponent
  rightIcon?: ReactNode; // Legacy

  // New standardized props
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onClose?: () => void;

  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  centerComponent?: ReactNode;

  children?: ReactNode; // Allow custom content if needed
};

export type BackButtonProps = {
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
};

export interface InputProps extends TextInputProps {
  icon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  inputRef?: React.RefObject<TextInput>;
}

export interface CustomButtonProps extends TouchableOpacityProps {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  loading?: boolean;
  children: ReactNode;
}

export type IconComponentProps = {
  item: CategoryType;
  size: number;
  color: string;
};

/* ===========================================
 * ACCOUNT / PROFILE TYPES
 * ===========================================
 */
export type AccountOptionType = {
  title: string;
  icon: ReactNode;
  bgColor: string;
  routeName?: string;
  badge?: number;
};

export type ProfileType = {
  id: string;
  fullName: string; // full_name
  avatarUrl?: string; // avatar_url
  createdAt?: string; // created_at
  theme: 'light' | 'dark' | 'system';
  currency: 'IDR' | 'USD' | 'EUR' | 'SGD';
  language: 'id' | 'en'; // Language preference (ISO 639-1)
};

export type UserType = {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
};

export type UserDataType = {
  name: string;
  image?: string;
};

/* ===========================================
 * DOMAIN TYPES — CATEGORIES / TRANSACTIONS / WALLETS
 * ===========================================
 */

// -------- CATEGORIES TABLE --------
export type CategoryType = {
  id?: string;
  userId?: string; // user_id
  name?: string;
  icon?: string;
  type?: "income" | "expense";
  bgColor?: string; // bg_color
  createdAt?: string; // created_at
};

// -------- TRANSACTIONS TABLE --------
export type TransactionType = {
  id?: string;
  userId: string; // user_id
  type: "income" | "expense" | "transfer";
  amount: number;
  note?: string;
  date: string | Date;
  categoryId?: string; // category_id
  category_id?: string; // backward compat
  wallet_id?: string;
  attachmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  is_transfer?: boolean;
  related_wallet_id?: string;
  from_wallet?: string;
  to_wallet?: string;
  wallet?: { name: string };
  // joined data
  categories?: CategoryType;
  category?: { id: string; name: string } | null;
};

// -------- TRANSACTION LIST --------
export type TransactionListType = {
  data: TransactionType[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
  onEditPress?: (item: TransactionType) => void;
  openSearch?: () => void;
  isLableSearch: boolean;
};

export type TransactionItemProps = {
  item: TransactionType;
  index: number;
  onEditPress?: (item: TransactionType) => void;
};

// -------- WALLET TABLE --------
export type WalletType = {
  id?: string;
  name: string;
  amount?: number;
  totalIncome?: number;
  totalExpenses?: number;
  image?: string;
  userId?: string;
  createdAt?: Date;
};

// -------- TAG TABLE --------
export type TagType = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  usage_count?: number; // For UI display
};

// -------- ANALITIC TABLE --------
export type AnalyticsData = {
  income: number;
  expense: number;
  balance: number;
  byCategory: { label: string; value: number }[];
  byDate: any[];
};

export type SummaryCardProps = {
  income: number;
  expense: number;
  balance: number;
};
