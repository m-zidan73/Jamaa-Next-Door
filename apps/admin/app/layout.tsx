import type { PropsWithChildren } from "react";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#063E4D",
          color: "#F7F5F2",
          fontFamily: "ui-rounded, system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
