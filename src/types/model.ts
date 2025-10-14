import { ReactNode } from "react";
import {
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
};

export type ModalWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
  bg?: string;
};
export type accountOptionType = {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  routeName?: any;
};

export type TypoProps = {
  size?: number;
  color?: string;
  fontWeight?: TextStyle["fontWeight"];
  children: any | null;
  style?: TextStyle;
  textProps?: TextProps;
};

// export type IconComponent = React.ComponentType<{
//   height?: number;
//   width?: number;
//   strokeWidth?: number;
//   color?: string;
//   fill?: string;
// }>;

// export type IconProps = {
//   name: string;
//   color?: string;
//   size?: number;
//   strokeWidth?: number;
//   fill?: string;
// };

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

// export type TransactionType = {
//   id?: string;
//   type: string;
//   amount: number;
//   category?: string;
//   date: Date | string;
//   note?: string;
//   image?: any;
//   uid?: string;
//   walletId: string;
// };

// export type CategoryType = {
//   name: string;
//   icon: string;
//   tyepe: "income" | "expense";
//   bgColor: string;
// };

// // Permanent icon metadata for vector-icons (no direct React components here)
// export type CategoryIconMeta = {
//   iconName: string;   // e.g. "cart"
//   iconPack: "Ionicons" | "MaterialCommunityIcons"; // which icon set to use
//   bgColor: string;
//   label: string;
//   value: string;
// };

// export type ExpenseCategoriesMeta = {
//   [key: string]: CategoryIconMeta;
// };

// export type ExpenseCategoriesType = {
//   [key: string]: CategoryType;
// };

export type TransactionListType = {
  data: TransactionType[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
  onEditPress?: Function;
  openSearch?: Function;
  isLableSearch: boolean;
};

export type TransactionItemProps = {
  item: TransactionType;
  index: number;
  onEditPress?: Function;
};

export type TransactionType = {
  id?: string;
  userId: string; // user_id
  type: "income" | "expense"; // type
  amount: number; // amount
  categoryId?: string; // category_id
  note?: string; // note
  date: string | Date; // date
  attachmentUrl?: string; // attachment_url
  createdAt?: string; // created_at
  updatedAt?: string; // updated_at
  categories?: CategoryType; // joined category data
  category?: { id: string; name: string } | null;
  category_id?: string;
};

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<TextInput>;
}

export type IconComponentProps = {
  item: CategoryType;
  size: number;
  color: string;
};

export interface CustomButtonProps extends TouchableOpacityProps {
  style?: ViewStyle;
  onPress?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

// export type ImageUploadProps = {
//   file?: any;
//   onSelect: (file: any) => void;
//   onClear: () => void;
//   containerStyle?: ViewStyle;
//   imageStyle?: ViewStyle;
//   placeholder?: string;
// };

// export type UserType = {
//   uid?: string;
//   email?: string | null;
//   name: string | null;
//   image?: any;
// } | null;

export type UserDataType = {
  name: string;
  image?: any;
};

// export type AuthContextType = {
//   user: UserType;
//   setUser: Function;
//   login: (
//     email: string,
//     password: string
//   ) => Promise<{ success: boolean; msg?: string }>;
//   register: (
//     email: string,
//     password: string,
//     name: string
//   ) => Promise<{ success: boolean; msg?: string }>;
//   logout: () => Promise<void>;
//   // Added to support refreshing user after profile update in dummy auth
//   updateUserData?: (uid?: string) => Promise<void> | void;
// };

// export type ResponseType = {
//   success: boolean;
//   data?: any;
//   msg?: string;
// };

// export type WalletType = {
//   id?: string;
//   name: string;
//   amount?: number;
//   totalIncome?: number;
//   totalExpenses?: number;
//   image: any;
//   uid?: string;
//   created?: Date;
// };

// -------------------
// TRANSACTIONS TABLE
// -------------------

// -------------------
// CATEGORIES TABLE
// -------------------
export type CategoryType = {
  id?: string;
  userId?: string; // user_id
  name?: string; // name
  icon?: string; // icon
  type?: "income" | "expense"; // type
  createdAt?: string; // created_at
  bgColor?: string; // bg_color
};

// -------------------
// PROFILES TABLE
// -------------------
export type ProfileType = {
  id: string; // id
  fullName: string; // full_name
  avatarUrl?: string; // avatar_url
  createdAt?: string; // created_at
};

// -------------------
// AUTH/USER WRAPPER
// -------------------
export type UserType = {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
};

// -------------------
// WALLET (custom, tidak ada di schema)
// -------------------
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
