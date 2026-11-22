import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
const buttonVariants = cva('button');
export function Button({className, ...props}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button className={twMerge(clsx(buttonVariants(), className))} {...props}/>;
}
