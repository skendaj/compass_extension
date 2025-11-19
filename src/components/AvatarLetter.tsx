export const AvatarLetter = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("");
  return <div className="avatar-letter">{initials}</div>;
};
