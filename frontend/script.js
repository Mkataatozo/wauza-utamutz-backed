const API_URL = "https://wauza-utamutz-backed.onrender.com/api";

// REGISTER
async function registerUser(name, email, password) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await response.json();

    if (data.success) {
      alert("Registration successful!");
      window.location.href = "login.html";
    } else {
      alert(data.message);
    }

  } catch (error) {
    alert("Error connecting to server");
  }
}

// LOGIN
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (data.success) {

      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");

      window.location.href = "dashboard.html";

    } else {
      alert(data.message);
    }

  } catch (error) {
    alert("Server error");
  }
}