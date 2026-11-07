import React from "react";
import {
  Utensils,
  Home,
  Plane,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  MoreHorizontal,
  CreditCard,
  Coffee,
  Car,
  Tag,
  DollarSign,
  LucideProps,
} from "lucide-react";

interface CategoryIconProps extends LucideProps {
  name: string;
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Utensils,
  Home,
  Plane,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  MoreHorizontal,
  CreditCard,
  Coffee,
  Car,
  Tag,
  DollarSign,
};

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const IconComponent = iconMap[name] || Tag;
  return <IconComponent aria-hidden="true" {...props} />;
}
