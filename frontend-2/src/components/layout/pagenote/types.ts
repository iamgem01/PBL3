export type Annotation = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  link?: string;
  color?: string;
};

export type TextBlock = {
  id: string;
  type: "text";
  text: string;
  annotations?: Annotation;
};

export type ToDoBlock = {
  id: string;
  type: "todo";
  text: string;
  checked: boolean;
};

export type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  alt?: string;
};
export type CodeBlock = {
  id: string;
  type: "code";
  code: string;
};

export type Block = TextBlock | ToDoBlock | ImageBlock| CodeBlock;
