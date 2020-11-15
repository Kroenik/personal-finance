function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

async function registerUser(event) {
  event.preventDefault();
  let username = document.querySelector("#reg-username").value.toLowerCase();
  let password = document.querySelector("#reg-password").value;
  let reppassword = document.querySelector("#rep-password").value;
  if (!username) {
    alert("Please provide a username");
  } else if (!password || password.length < 8 || !passwordContainsNumber(password)) {
    alert("Please provide a password with at least 8 characters and at least containing one number.");
  } else if (reppassword !== password) {
    alert("Password is not matching the repetition password, please repeat");
    document.querySelector("#reg-password").value = "";
    document.querySelector("#rep-password").value = "";
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
      document.querySelector("#rep-password").value = "";
      off();
      alert("User registered successfully");
    }
  }
}

async function loginUser(event) {
  const logUser = { username: document.querySelector("#log-username").value.toLowerCase(), password: document.querySelector("#log-password").value };
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
    localStorage.setItem("username", document.querySelector("#log-username").value.toLowerCase());
    window.location.replace("http://localhost:3000/overview.html");
  }
}

function logOnEnter(event) {
  if (event.code === "Enter") {
    event.preventDefault();
    document.getElementById("log-button").click();
  }
}

function regOnEnter(event) {
  if (event.code === "Enter") {
    event.preventDefault();
    document.getElementById("reg-button").click();
  }
}

function passwordContainsNumber(password) {
  return /\d/.test(password);
}
