import * as React from 'react';
import { ProtoInfo } from '../../behaviour';
import { colors, fontSize, spacing } from '../../theme/tokens';

interface RequestTypeProps {
  protoInfo?: ProtoInfo
}

export function RequestType({ protoInfo }: RequestTypeProps) {
  let reqType = "Unary Call";

  if (!protoInfo) {
    reqType = "Server Address";
  } else if (protoInfo.isServerStreaming() && protoInfo.isClientStreaming()) {
    reqType = "Bi-Directional";
  } else if (protoInfo.isServerStreaming()) {
    reqType = "Server Streaming";
  } else if (protoInfo.isClientStreaming()) {
    reqType = "Client Streaming";
  }

  return (
    <div style={{...styles.reqType, ...styles.badge}}>
      {reqType}
    </div>
  );
}

const styles = {
  reqType: {
    textOverflow: "ellipsis",
    maxWidth: "125px",
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
    width: "100%",
  },
  badge: {
    backgroundColor: colors.bgDark,
    padding: `${spacing.sm - 1}px ${spacing.sm}px`,
    fontSize: `${fontSize.xs}px`,
    color: colors.white,
    fontWeight: 500,
  },
};