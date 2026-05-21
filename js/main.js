import { signInWithGoogle } from "./auth.js";

const oauthButton = document.getElementById("oauthButton");
oauthButton.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    const user = await signInWithGoogle();
    window.location.href = "home.html";
  } catch (error) {
    console.error("Error during Google sign-in:", error);
  }
});
