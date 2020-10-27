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
    body: JSON.stringify(user),
  });
  window.location.replace("http://localhost:3000/overview.html");
}

//Application page START

getTransactions();

async function getTransactions() {
  const res = await fetch("http://localhost:3000/transactions");
  const transactions = await res.json();

  const transactionsPosition = document.querySelector("#transactions");
  renderTransactions(transactionsPosition, transactions);
}

function renderTransactions(position, transactionsData) {
  for (const transactionData of transactionsData) {
    const newTransaction = createTransaction(transactionData);
    position.appendChild(newTransaction);
  }
}

function createTransaction(data) {
  const transactionDiv = document.createElement("div");
  transactionDiv.classList.add("transaction");
  const amountP = document.createElement("p");
  amountP.classList.add("amount");
  const categoryP = document.createElement("p");
  categoryP.classList.add("category");
  const titleP = document.createElement("p");
  titleP.classList.add("title");

  transactionDiv.appendChild(amountP);
  transactionDiv.appendChild(categoryP);
  transactionDiv.appendChild(titleP);
  amountP.textContent = data.amount + "€";
  categoryP.textContent = data.category;
  titleP.textContent = data.title;

  return transactionDiv;
}

function onAddButton(event) {
  event.preventDefault();

  const inputData = document.forms[0].elements;
  const inputTitle = inputData["input_title"].value;
  const inputType = inputData["input_type"].value;
  const inputAmount = inputData["input_amount"].value;
  const inputCategory = inputData["input_category"].value;

  if (!inputTitle || !inputAmount) {
    alert("Watch out! - The title and/or amount is missing.");
  } else if (inputTitle.length > 20) {
    alert("Watch out! - The title is too long (max=20digits).");
  } else {
    postToJson({
      title: inputTitle,
      amount: inputAmount,
      type: inputType,
      category: inputCategory,
    });
  }
}

async function postToJson(obj) {
  const res = await fetch("http://localhost:3000/transactions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      //Authorization: Bearer,
    },
    body: JSON.stringify(obj),
  });

  const currentTransactions = document.querySelector("#transactions");
  clearChildren(currentTransactions);
  getTransactions();
}

function clearChildren(element) {
  while (element.firstElementChild != null) {
    element.removeChild(element.firstElementChild);
    document.forms[0].reset();
  }
}
