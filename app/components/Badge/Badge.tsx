import type { ReactNode } from 'react';
import { colors, fontSize, spacing } from '../../theme/tokens';

interface BadgeProps {
  type: "protoFile" | "service" | "method"
  children: ReactNode
}

export function Badge({ type, children }: BadgeProps) {

  return (
    <div style={{
      ...styles.badge,
      ...styles[type]
    }}>{children}</div>
  )
}

const styles: {[key: string]: any} = {
  badge: {
    lineHeight: "15px",
    fontSize: `${fontSize.xs}px`,
    marginTop: `${spacing.xs}px`,
    marginRight: `${spacing.sm - 1}px`,
    paddingBottom: "1px",
  },
  protoFile: {
    backgroundColor: colors.primary,
    color: colors.white,
  },
  service: {
    backgroundColor: colors.warning,
    color: colors.white,
  },
  method: {
    backgroundColor: colors.success,
    color: colors.white,
  },
};