import { JSX, ReactNode } from "react";

type Props = {
  level: 1 | 2 | 3;
  children: ReactNode;
};

export default function Header({ level, children }: Props) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return <Tag className="text-3xl lg:text-4xl">{children}</Tag>;
}
