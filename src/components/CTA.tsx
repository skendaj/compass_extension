import type { ReactNode } from "react";

export const CTAIconButton = ({
  icon,
  onClick,
  title,
  disabled = false,
  props,
}: {
  icon: ReactNode;
  onClick: () => void;
  title: string;
  disabled: boolean;
  props?: any;
}) => {
  return (
    <button
      className="single-mui-icon-btn"
      title={title}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon}
    </button>
  );
};
