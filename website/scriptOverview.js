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

async function transactionsToUI(userTransactions) {
  const transactionsPosition = document.querySelector("#transactions");
  console.log(await userTransactions);
  appendTransactionsToHTML(transactionsPosition, await userTransactions);
}

function appendTransactionsToHTML(position, transactionsData) {
  for (const transactionData of transactionsData) {
    const newTransaction = createTransaction(transactionData);
    position.prepend(newTransaction);
  }
}

var id_index = 0;

function createTransaction(data) {
  const transactionDiv = document.createElement("div");
  transactionDiv.classList.add("transaction");
  transactionDiv.setAttribute("id", data.user + "-" + id_index++);

  const amountP = document.createElement("p");
  if (data.amount < 0) {
    amountP.classList.add("expense");
  } else {
    amountP.classList.add("profit");
  }

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  //deleteButton.onclick = deleteTransaction(this);

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

// function deleteTransaction(this_transaction) {
//   console.log(this_transaction.parentNode.id);
// }

function addTransaction(event) {
  //event.preventDefault();

  const inputData = document.forms[0].elements;
  const inputTitle = inputData["input_title"].value;
  //const inputType = inputData["input_type"].value;
  const inputType = typeInput;
  const inputAmount = inputData["input_amount"].value;
  const inputCategory = inputData["input_category"].value;

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
      //type: inputType,
      category: inputCategory,
      user: localStorage.getItem("username"),
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
    //sum += parseFloat(transaction.amount);
  });
  totalBalance = totalExpense + totalProfit;

  const totalDiv = document.createElement("div");
  totalDiv.classList.add("total");
  document.querySelector("#input").insertBefore(totalDiv, document.getElementById("expense-button"));

  const totalBalanceDiv = document.createElement("div");
  totalBalanceDiv.classList.add("total-calculations");
  totalDiv.appendChild(totalBalanceDiv);

  const totalExpenseDiv = document.createElement("div");
  totalExpenseDiv.classList.add("total-calculations");
  totalDiv.appendChild(totalExpenseDiv);

  const totalProfitDiv = document.createElement("div");
  totalProfitDiv.classList.add("total-calculations");
  totalDiv.appendChild(totalProfitDiv);

  totalBalanceDiv.textContent = "Balance: " + totalBalance + "€";
  totalExpenseDiv.textContent = "Total expense: " + totalExpense + "€";
  totalProfitDiv.textContent = "Total Profit: " + totalProfit + "€";
}

async function logOut() {
  localStorage.clear();
  window.location.replace("http://localhost:3000");
}
let typeInput;

transactionsToUI(getUserTransactions());
displayBalance(getUserTransactions());
