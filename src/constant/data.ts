// import { ExpenseCategoriesMeta } from "@/types/model";

// export const expenseCategories: ExpenseCategoriesMeta = {
//   groceries: {
//     label: "Groceries",
//     value: "groceries",
//     iconName: "cart",
//     iconPack: "Ionicons",
//     bgColor: "#4CAF50",
//   },
//   rent: {
//     label: "Rent",
//     value: "rent",
//     iconName: "home",
//     iconPack: "Ionicons",
//     bgColor: "#607D8B",
//   },
//   utilities: {
//     label: "Utilities",
//     value: "utilities",
//     iconName: "bulb",
//     iconPack: "Ionicons",
//     bgColor: "#FFC107",
//   },
//   transportation: {
//     label: "Transportation",
//     value: "transportation",
//     iconName: "car",
//     iconPack: "Ionicons",
//     bgColor: "#2196F3",
//   },
//   entertainment: {
//     label: "Entertainment",
//     value: "entertainment",
//     iconName: "film",
//     iconPack: "Ionicons",
//     bgColor: "#E91E63",
//   },
//   dining: {
//     label: "Dining",
//     value: "dining",
//     iconName: "restaurant",
//     iconPack: "Ionicons",
//     bgColor: "#FF5722",
//   },
//   health: {
//     label: "Health",
//     value: "health",
//     iconName: "heart",
//     iconPack: "Ionicons",
//     bgColor: "#F44336",
//   },
//   insurance: {
//     label: "Insurance",
//     value: "insurance",
//     iconName: "shield-checkmark",
//     iconPack: "Ionicons",
//     bgColor: "#673AB7",
//   },
//   saving: {
//     label: "Saving",
//     value: "saving",
//     iconName: "wallet",
//     iconPack: "Ionicons",
//     bgColor: "#009688",
//   },
//   clothing: {
//     label: "Clothing",
//     value: "clothing",
//     iconName: "shirt",
//     iconPack: "Ionicons",
//     bgColor: "#FF7043",
//   },
//   Personal: {
//     label: "Personal",
//     value: "Personal",
//     iconName: "person",
//     iconPack: "Ionicons",
//     bgColor: "#795548",
//   },
//   others: {
//     label: "Others",
//     value: "others",
//     iconName: "ellipsis-horizontal-circle",
//     iconPack: "Ionicons",
//     bgColor: "#9E9E9E",
//   },
// };


// export const incomeCategories = {
//   label: "Income",
//   value: "income",
//   iconName: "cash",
//   iconPack: "Ionicons",
//   bgColor: "#32CD32",
// } as const;

// export const transactionTypes = [
//     {
//         label: "Income",
//         value: "income",
//     },
//     {
//         label: "Expense",
//         value: "expense",
//     },
//     ];

import { accountOptionType } from "@/types/model";
import { colors } from "./theme";

export const accountOptions: accountOptionType[] = [
    {
      title: "Edit Profile",
      icon: "person-circle-outline",
      bgColor: "#6366f1",
    },
    {
      title: "Settings",
      icon: "settings-outline",
      bgColor: "#069669",
    },
    {
      title: "Privacy Policey",
      icon: "shield-checkmark-outline",
      bgColor: colors.neutral600,
    },
    {
      title: "Logout",
      icon: "log-out-outline",
      bgColor: "#e11d48",
    },
  ];