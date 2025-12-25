import admin from "../config/firebase.js";

export async function sendBudgetAlert(tokens, spent, limit) {
  if (!tokens || tokens.length === 0) return;

  const message = {
    tokens,
    notification: {
      title: "Budget Alert 🚨",
      body: `You spent ₹${spent} and crossed your budget of ₹${limit}`,
    },
  };

  await admin.messaging().sendEachForMulticast(message);
}
