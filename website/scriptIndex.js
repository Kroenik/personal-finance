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

  let user = { username: username, password: password };
  const res = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  window.location.replace("http://localhost:3000/overview.html");
}
