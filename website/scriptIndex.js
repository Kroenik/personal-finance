function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

async function registerUser(event) {
  event.preventDefault();
  let username = document.querySelector("#reg-username").value;
  let password = document.querySelector("#reg-password").value;
  if (!username) {
    alert("Please provide a username");
  } else if (!password || password.length < 6) {
    alert("Please provide a password with at least 6 characters.");
  } else {
    let newUser = { username: username, password: password };

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
  const resultJSON = await result.json();
  if (resultJSON.unauthorized) {
    alert("Username or password was invalid");
  } else {
    localStorage.setItem("token", JSON.stringify(resultJSON.token));

    window.location.replace("http://localhost:3000/overview.html");
  }
}
