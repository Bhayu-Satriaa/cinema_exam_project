import { signInWithGoogle, saveUserToFirestore, authGuard } from "./auth.js";

authGuard(true);

const oauthButton = document.getElementById("oauthButton");
if (oauthButton) {
  oauthButton.addEventListener("click", async () => {
    try {
      const user = await signInWithGoogle();
      await saveUserToFirestore(user);
      window.location.href = "home.html";
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  });
}
