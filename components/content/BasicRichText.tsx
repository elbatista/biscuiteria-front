import { Fragment, type ReactNode } from "react";

type BasicRichTextProps = {
  text: string;
};

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\n)/g);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part === "\n") {
      return <br key={`br-${index}`} />;
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`strong-${index}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={`em-${index}`}>
          {part.slice(1, -1)}
        </em>
      );
    }

    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
}

export default function BasicRichText({ text }: BasicRichTextProps) {
  return <>{renderInlineMarkdown(text)}</>;
}
