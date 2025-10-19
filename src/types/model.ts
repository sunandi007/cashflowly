import { ReactNode } from "react";
import {
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

/* ===========================================
 * WRAPPER COMPONENT TYPES
 * ===========================================
 */
export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: ReactNode;
};

export type ModalWrapperProps = {
  style?: ViewStyle;
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
  style?: TextStyle;
  textProps?: TextProps;
};

export type HeaderProps = {
  title?: string;
  style?: ViewStyle;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type BackButtonProps = {
  style?: ViewStyle;
  iconSize?: number;
};

export interface InputProps extends TextInputProps {
  icon?: ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<TextInput>;
}

export interface CustomButtonProps extends TouchableOpacityProps {
  style?: ViewStyle;
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
};

export type ProfileType = {
  id: string;
  fullName: string; // full_name
  avatarUrl?: string; // avatar_url
  createdAt?: string; // created_at
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
  type: "income" | "expense";
  amount: number;
  note?: string;
  date: string | Date;
  categoryId?: string; // category_id
  category_id?: string; // backward compat
  wallet_id?: string;
  attachmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;

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
