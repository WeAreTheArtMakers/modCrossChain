export function toHumanBridgeError(error: unknown) {
  const message = getErrorMessage(error);

  if (/user rejected|user denied|rejected request|denied transaction/i.test(message)) {
    return "Transaction was rejected in the wallet.";
  }

  if (/insufficient/i.test(message)) {
    return "Insufficient balance for the amount and required gas.";
  }

  if (/no route|route/i.test(message)) {
    return "No LI.FI route is available for this token, amount, and chain pair.";
  }

  if (/network|chain|switch/i.test(message)) {
    return "Wallet network mismatch. Switch to the source chain and try again.";
  }

  if (/token/i.test(message)) {
    return message;
  }

  if (/exchange rate has changed|slippage/i.test(message)) {
    return "The route changed before execution. Refresh the quote and try again.";
  }

  if (/failed to fetch|networkerror|timeout/i.test(message)) {
    return "Could not reach the LI.FI API. Check your connection and try again.";
  }

  return message || "Bridge transaction failed. Review the route and try again.";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  return "";
}
