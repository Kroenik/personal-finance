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

  // addNewCategory(inputCategory);
}

async function postTransactionToJson(obj) {
  const res = await fetch("http://localhost:3000/transactions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")),
    },
    body: JSON.stringify(obj),
  });

  updateAllData();
}

async function deleteTransactionFromJson(id) {
  const res = await fetch("http://localhost:3000/transactions/" + id, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")),
    },
  });

  updateAllData();
}

function updateAllData() {
  const currentTransactions = document.querySelector("#transactions");
  const currentCategories = document.querySelector("#categories");
  const currentBalance = document.querySelector("#total-table");
  clearChildren(currentTransactions);
  clearChildren(currentCategories);
  clearChildren(currentBalance);

  const updatedTransactions = getUserTransactions();
  transactionsToUI(updatedTransactions);
  groupAmountByCategory(updatedTransactions);
  displayBalance(updatedTransactions);
}

function clearChildren(element) {
  while (element.firstElementChild != null) {
    element.removeChild(element.firstElementChild);
    document.forms[0].reset();
  }
}

function switchCategoryOptionsTo(arr) {
  const allOptions = document.querySelector("#category-options"); //("#input_category");
  clearChildren(allOptions);

  // defaultOption = document.createElement("option");
  // defaultOption.disabled = true;
  // defaultOption.selected = true;
  // allOptions.appendChild(defaultOption);
  // defaultOption.textContent = "choose a category";

  let option = [];

  for (let i = 0; i < arr.length; i++) {
    option[i] = document.createElement("option");
  }
  for (let j = 0; j < arr.length; j++) {
    allOptions.appendChild(option[j]);
  }
  for (let u = 0; u < arr.length; u++) {
    option[u].textContent = arr[u];
  }
}

// function addNewCategory(inputCategory) {

// }

function setExpense() {
  typeInput = false;
  document.getElementById("expense-button").className = "expense-button-on";
  document.getElementById("profit-button").className = "profit-button-off";

  const expenseOptions = ["Groceries", "Restaurant", "Entertainment", "Travel", "Education", "Clothes", "other ... expense"];
  switchCategoryOptionsTo(expenseOptions);
}
function setProfit() {
  typeInput = true;
  document.getElementById("expense-button").className = "expense-button-off";
  document.getElementById("profit-button").className = "profit-button-on";

  const profitOptions = ["Salary", "Pocket Money", "Present", "Casino", "Found", "Stolen", "other ... profit"];
  switchCategoryOptionsTo(profitOptions);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
async function groupAmountByCategory(transactions) {
  let categories = [];
  let userTransactions = await transactions;
  userTransactions.forEach((transaction) => {
    categories.push(transaction.category);
  });

  let uniqueCategories = categories.filter(onlyUnique);
  let amountsByCategory = {};

  uniqueCategories.forEach((category) => {
    amountsByCategory[category] = 0;
  });

  userTransactions.forEach((transaction) => {
    amountsByCategory[transaction.category] = amountsByCategory[transaction.category] + parseFloat(transaction.amount);
  });
  amountsByCategory = Object.keys(amountsByCategory).map((key) => [String(key), amountsByCategory[key]]);

  toWebsite(amountsByCategory);
}

function toWebsite(amountsByCategory) {
  const transactionsPosition = document.querySelector("#categories");
  for (const category of amountsByCategory) {
    const newCategorie = createCategory(category);
    transactionsPosition.prepend(newCategorie);
  }
}

function createCategory(data) {
  const categoryDiv = document.createElement("div");
  categoryDiv.classList.add("transaction");
  const amountP = document.createElement("p");
  const categoryP = document.createElement("p");
  categoryP.classList.add("category");
  categoryDiv.appendChild(amountP);
  categoryDiv.appendChild(categoryP);

  amountP.textContent = data[1] + "€";
  categoryP.textContent = data[0];

  return categoryDiv;
}

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

  const totalTable = document.querySelector("#total-table");

  const balanceRow = createTableRow("Balance", totalBalance);
  const expenseRow = createTableRow("Expense", totalExpense);
  const profitRow = createTableRow("Profit", totalProfit);

  totalTable.appendChild(balanceRow);
  totalTable.appendChild(expenseRow);
  totalTable.appendChild(profitRow);
}

function createTableRow(totalType, totalAmount) {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  const td = document.createElement("td");

  if (totalType === "Balance") {
    if (totalAmount < 0) {
      td.classList.add("total-balance-negative");
    } else {
      td.classList.add("total-balance-positive");
    }
  }
  td.classList.add("total-calculations");

  tr.appendChild(th);
  tr.appendChild(td);
  th.textContent = totalType;
  td.textContent = totalAmount.toFixed(2) + "€";

  return tr;
}

async function logOut() {
  localStorage.clear();
  window.location.replace("http://localhost:3000");
}

function generateId() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
}

//let typeInput = false;

transactionsToUI(getUserTransactions());
groupAmountByCategory(getUserTransactions());
displayBalance(getUserTransactions());
setExpense();
