import { useState, useEffect } from "react";

const steam0 = "    ))))\n" + "   ((((\n" + "    ))))\n";
const steam1 = "   ((((\n" + "    ))))\n" + "   ((((\n";
const steam = [steam0, steam1];

const coffeeASCII = (steamKey: 0 | 1) =>
  steam[steamKey] +
  " _ .---.\n" +
  "( |`---'|\n" +
  " \\|     |\n" +
  "   .___,\n";

export const CoffeeCup = ({
  size = "sm",
}: {
  size?: "xs" | "sm" | "md" | "xl" | "2xl";
}) => {
  const [steamKey, setSteamKey] = useState<0 | 1>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSteamKey((prev) => (prev === 0 ? 1 : 0));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <pre className={`text-${size}`}>{coffeeASCII(steamKey)}</pre>;
};
