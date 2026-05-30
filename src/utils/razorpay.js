// src/utils/razorpay.js

export function loadRazorpay() {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    // Remove any broken existing script tags first
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Razorpay loaded but window.Razorpay is undefined"));
      }
    };

    script.onerror = () =>
      reject(new Error("Failed to load Razorpay script"));

    document.body.appendChild(script);
  });
}