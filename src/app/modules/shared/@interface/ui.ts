export type IconSize = 'sm' | 'md' | 'xl';

export interface DialogConfig {
  title?: string;
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  closable?: boolean;
  backdrop?: boolean;
  className?: string;
};

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
  visible: boolean;
  paused: boolean;
  createdAt: number;
}
