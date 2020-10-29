function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

async function registerUser(event) {
  event.preventDefault();
  let newUser = { username: document.querySelector("#reg-username").value, password: document.querySelector("#reg-password").value };

  const res = await fetch("http://localhost:3000/users");
  const regUsers = await res.json();

  let checker;
  regUsers.forEach((regUser) => {
    if (regUser.username.toLowerCase() === newUser.username.toLowerCase()) {
      checker = true;
    }
  });

  if (checker) {
    alert("Username is already registered. Please choose a different one");
    checker = false;
  } else {
    const result = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });
    document.querySelector("#reg-username").value = "";
    document.querySelector("#reg-password").value = "";
    off();
  }
}

async function loginUser(event) {
  let logUser = { username: document.querySelector("#log-username").value, password: document.querySelector("#log-password").value };
  const result = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(logUser),
  });
  const token = await result.json();
  localStorage.setItem("token", JSON.stringify(token.token));

  window.location.replace("http://localhost:3000/overview.html");
}
