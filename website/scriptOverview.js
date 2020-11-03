//const { response } = require("express");

async function getUserTransactions() {
  const res = await fetch("http://localhost:3000/transactions", {
    Method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")),
    },
  });
  const transactions = await res.json();
  let userTransactions = [];
  transactions.forEach((element) => {
    if (element.user === localStorage.getItem("username")) {
      userTransactions.push(element);
    }
  });
  return userTransactions;
}

// async function transactionsToUI(userTransactions) {
//   const transactionsPosition = document.querySelector("#transactions");
//   console.log(await userTransactions);
//   appendTransactionsToHTML(transactionsPosition, await userTransactions);
// }

// function appendTransactionsToHTML(position, transactionsData) {
//   for (const transactionData of transactionsData) {
//     const newTransaction = createTransaction(transactionData);
//     position.prepend(newTransaction);
//   }
// }
async function transactionsToUI(userTransactions) {
  const transactionsPosition = document.querySelector("#transactions");
  for (const userTransaction of await userTransactions) {
    const newTransaction = createTransaction(userTransaction);
    transactionsPosition.prepend(newTransaction);
  }
}

function createTransaction(data) {
  const transactionDiv = document.createElement("div");
  transactionDiv.classList.add("transaction");
  transactionDiv.setAttribute("id", data.id);

  const amountP = document.createElement("p");
  if (data.amount < 0) {
    amountP.classList.add("expense");
  } else {
    amountP.classList.add("profit");
  }

  const deleteButton = document.createElement("button");
  deleteButton.addEventListener(
    "click",
    function () {
      deleteTransactionFromJson(data.id);
    },
    false
  );
  deleteButton.classList.add("delete-button");
  //deleteButton.setAttribute("id", data.id);

  const categoryP = document.createElement("p");
  categoryP.classList.add("category");

  const titleP = document.createElement("p");
  titleP.classList.add("title");

  transactionDiv.appendChild(amountP);
  transactionDiv.appendChild(deleteButton);
  transactionDiv.appendChild(categoryP);
  transactionDiv.appendChild(titleP);

  amountP.textContent = data.amount + "€";
  deleteButton.textContent = "delete";
  categoryP.textContent = data.category;
  titleP.textContent = data.title;

  return transactionDiv;
}

function addTransaction(event) {
  //event.preventDefault();

  const inputData = document.forms[0].elements;
  const inputTitle = inputData["input_title"].value;
  const inputType = typeInput;
  const inputAmount = inputData["input_amount"].value;
  const inputCategory = inputData["input_category"].value;
  const transactionId = generateId();

  if (!inputTitle || !inputAmount) {
    alert("Watch out! - The title and/or amount is missing.");
  } else if (inputTitle.length > 20) {
    alert("Watch out! - The title is too long (max=20digits).");
  } else {
    if (inputType) {
      amount = inputAmount;
    } else {
      amount = "-".concat(inputAmount);
    }
    postTransactionToJson({
      title: inputTitle,
      amount: amount,
      category: inputCategory,
      user: localStorage.getItem("username"),
      id: transactionId,
    });
  }
}

async function postTransactionToJson(obj) {
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

async function deleteTransactionFromJson(id) {
  const res = await fetch("http://localhost:3000/transactions/" + id, {
    method: "DELETE",
  });
  //const currentTransactions = document.querySelector("#transactions");
  //clearChildren(currentTransactions);
  //getTransactions();
  //const updatedUserTransactions = getUserTransactions();
  //transactionsToUI(updatedUserTransactions);
  //displayBalance(updatedUserTransactions);
  location.reload();
}

function clearChildren(element) {
  while (element.firstElementChild != null) {
    element.removeChild(element.firstElementChild);
    document.forms[0].reset();
  }
}

function setExpense() {
  typeInput = false;
  document.getElementById("expense-button").className = "expense-button-on";
  document.getElementById("profit-button").className = "profit-button-off";
}
function setProfit() {
  typeInput = true;
  document.getElementById("expense-button").className = "expense-button-off";
  document.getElementById("profit-button").className = "profit-button-on";
}
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
// async function groupAmountByCategorie(userTransactions) {
//   let categories = [];
//   console.log(userTransactions);
//   userTransactions.forEach((transaction) => {
//     categories.push(transaction.category);
//   });
//   let unique = categories.filter(onlyUnique);
//   console.log(unique);
// }

async function displayBalance(transactions) {
  let userTransactions = await transactions;
  let totalBalance = 0;
  let totalProfit = 0;
  let totalExpense = 0;

  userTransactions.forEach((transaction) => {
    amount = parseFloat(transaction.amount);
    if (amount < 0) {
      totalExpense += amount;
    } else {
      totalProfit += amount;
    }
  });
  totalBalance = totalExpense + totalProfit;

  const totalBalanceTd = document.createElement("td");
  if (totalBalance < 0) {
    totalBalanceTd.classList.add("total-balance-negative");
  } else {
    totalBalanceTd.classList.add("total-balance-positive");
  }
  totalBalanceTd.classList.add("total-calculations");
  document.querySelector("#balance").appendChild(totalBalanceTd);

  const totalExpenseTd = document.createElement("td");
  totalExpenseTd.classList.add("total-calculations");
  document.querySelector("#total-expense").appendChild(totalExpenseTd);

  const totalProfitTd = document.createElement("td");
  totalProfitTd.classList.add("total-calculations");
  document.querySelector("#total-profit").appendChild(totalProfitTd);

  totalBalanceTd.textContent = totalBalance + "€";
  totalExpenseTd.textContent = totalExpense + "€";
  totalProfitTd.textContent = totalProfit + "€";
}

async function logOut() {
  localStorage.clear();
  window.location.replace("http://localhost:3000");
}

function generateId() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
}

let typeInput;
//var id_index = 0;

transactionsToUI(getUserTransactions());
displayBalance(getUserTransactions());
