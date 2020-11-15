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

async function getUserTransactionsByMonth(startDate, endDate) {
  const allUserTransactions = await getUserTransactions();
  let userTransactionsByMonth = [];
  allUserTransactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date);
    if (transactionDate >= startDate && transactionDate <= endDate) {
      userTransactionsByMonth.push(transaction);
    }
  });
  return userTransactionsByMonth;
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
      deleteTransactionFromJson(data.id, data.date);
    },
    false
  );
  deleteButton.classList.add("delete-button");

  const categoryP = document.createElement("p");
  categoryP.classList.add("category");

  const titleP = document.createElement("p");
  titleP.classList.add("title");

  const dateSpan = document.createElement("span");
  dateSpan.classList.add("title");

  transactionDiv.appendChild(amountP);
  transactionDiv.appendChild(deleteButton);
  transactionDiv.appendChild(categoryP);
  transactionDiv.appendChild(titleP);
  transactionDiv.appendChild(dateSpan);

  amountP.textContent = data.amount + "€";
  deleteButton.textContent = "delete";
  categoryP.textContent = data.category;
  titleP.textContent = data.title;
  dateSpan.textContent = data.date;

  return transactionDiv;
}

function addTransaction(event) {
  const inputData = document.forms[0].elements;
  const inputTitle = inputData["input_title"].value;
  const inputType = typeInput;
  const inputDate = document.getElementById("input_year").value + "-" + document.getElementById("input_month").value + "-" + document.getElementById("input_day").value;
  console.log(inputDate);
  const inputAmount = inputData["input_amount"].value;
  const inputCategory = inputData["input_category"].value;
  const transactionId = generateId();

  try {
    if (!inputTitle) throw "The title is missing.";
    if (inputTitle.length > 30) throw "The title is too long (max=30digits).";
    if (!inputDate) throw "The date is missing.";
    // if (!/\d{4}-\d{2}-\d{2}/.test(inputDate)) throw "The date format is wrong. -> Format: YYYY-MM-DD";
    if (!inputAmount) throw "The amount is missing.";
    inputAmountNumber = Number(inputAmount);
    if (inputAmountNumber < 0) throw "The amount can't be negativ.";
    if (!inputCategory) throw "The category is missing.";
    if (inputTitle.length > 20) throw "The category is too long (max=20digits).";
  } catch (err) {
    alert("Error: " + err);
    return;
  }
  // if (!inputTitle || !inputAmount) {
  //   alert("Watch out! - The title and/or amount is missing.");
  // } else if (inputTitle.length > 20) {
  //   alert("Watch out! - The title is too long (max=20digits).");
  // } else {
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
    date: inputDate,
  });
}
//}

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

  showSpezificMonth(obj.date); //Monat der Eingabe übergeben
}

async function deleteTransactionFromJson(id, date) {
  const res = await fetch("http://localhost:3000/transactions/" + id, {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")),
    },
  });

  showSpezificMonth(date); //aktuelle Anzeige lassen
}

async function updateAllData(date) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1); //vielleicht auslagern

  const currentTransactions = document.querySelector("#transactions");
  const currentCategories = document.querySelector("#categories");
  const currentBalance = document.querySelector("#total-table");
  clearChildren(currentTransactions);
  clearChildren(currentCategories);
  clearChildren(currentBalance);

  const updatedTransactions = getUserTransactionsByMonth(startOfMonth, endOfMonth);
  transactionsToUI(updatedTransactions);
  groupAmountByExpenseCategory(updatedTransactions);
  displayBalance(await getUserTransactions());
  displayTotalExpenseAndProfit(updatedTransactions);
  setExpense();
  setDayDropdown(date.getMonth() + 1);
}

function clearChildren(element) {
  while (element.firstElementChild != null) {
    element.removeChild(element.firstElementChild);
    document.forms[0].reset();
  }
}

function switchDropdownOptionsTo(arr, dropdownName) {
  const allOptions = document.querySelector(dropdownName);
  clearChildren(allOptions);

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

function setDayDropdown(month) {
  const daysFeb = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29"];
  const daysShort = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];
  const daysLong = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];

  month = parseInt(month);

  if (month === 2) {
    switchDropdownOptionsTo(daysFeb, "#input_day");
  } else if (month === 04 || month === 06 || month === 09 || month === 11) {
    switchDropdownOptionsTo(daysShort, "#input_day");
  } else if (month === 01 || month === 03 || month === 05 || month === 07 || month === 08 || month === 10 || month === 12) {
    switchDropdownOptionsTo(daysLong, "#input_day");
  }
  document.getElementById("input_month").selectedIndex = month - 1;
}

function setExpense() {
  typeInput = false;
  document.getElementById("expense-button").className = "expense-button-on";
  document.getElementById("profit-button").className = "profit-button-off";

  const expenseOptions = ["Groceries", "Restaurant", "Entertainment", "Travel", "Education", "Clothes", "other..."];
  switchDropdownOptionsTo(expenseOptions, "#category-options");
}
function setProfit() {
  typeInput = true;
  document.getElementById("expense-button").className = "expense-button-off";
  document.getElementById("profit-button").className = "profit-button-on";

  const profitOptions = ["Salary", "Pocket Money", "Present", "Casino", "Found", "Stolen", "other..."];
  switchDropdownOptionsTo(profitOptions, "#category-options");
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

async function groupAmountByExpenseCategory(transactions) {
  let expenseCategories = [];
  let userTransactions = await transactions;

  userTransactions.forEach((transaction) => {
    expenseCategories.push(transaction.category);
  });

  let uniqueExpenseCategories = expenseCategories.filter(onlyUnique);
  let amountsByExpenseCategory = {};

  uniqueExpenseCategories.forEach((category) => {
    amountsByExpenseCategory[category] = 0;
  });

  userTransactions.forEach((transaction) => {
    if (transaction.amount < 0) {
      amountsByExpenseCategory[transaction.category] = amountsByExpenseCategory[transaction.category] + parseFloat(transaction.amount);
    }
  });
  amountsByExpenseCategory = Object.keys(amountsByExpenseCategory).map((key) => [String(key), amountsByExpenseCategory[key]]);

  toWebsite(amountsByExpenseCategory, "expense");
}

async function groupAmountByProfitCategory(transactions) {
  let profitCategories = [];
  let userTransactions = await transactions;

  userTransactions.forEach((transaction) => {
    profitCategories.push(transaction.category);
  });

  let uniqueProfitCategories = profitCategories.filter(onlyUnique);
  let amountsByProfitCategory = {};

  uniqueProfitCategories.forEach((category) => {
    amountsByProfitCategory[category] = 0;
  });

  userTransactions.forEach((transaction) => {
    if (transaction.amount > 0) {
      amountsByProfitCategory[transaction.category] = amountsByProfitCategory[transaction.category] + parseFloat(transaction.amount);
    }
  });
  amountsByProfitCategory = Object.keys(amountsByProfitCategory).map((key) => [String(key), amountsByProfitCategory[key]]);

  toWebsite(amountsByProfitCategory, "profit");
}

function toWebsite(amountsByCategory, transactionType) {
  const transactionsPosition = document.querySelector("#categories");
  clearChildren(transactionsPosition);

  if (transactionType === "expense") {
    document.getElementById("expense-button-2").className = "expense-button-on";
    document.getElementById("profit-button-2").className = "profit-button-off";

    for (const category of amountsByCategory) {
      if (category[1] < 0) {
        const newCategorie = createCategory(category);
        transactionsPosition.prepend(newCategorie);
      }
    }
  } else {
    document.getElementById("expense-button-2").className = "expense-button-off";
    document.getElementById("profit-button-2").className = "profit-button-on";

    for (const category of amountsByCategory) {
      if (category[1] > 0) {
        const newCategorie = createCategory(category);
        transactionsPosition.prepend(newCategorie);
      }
    }
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

async function displayBalance(allTransactions) {
  let transactions = await allTransactions;
  let totalBalance = 0;
  let totalProfit = 0;
  let totalExpense = 0;

  transactions.forEach((transaction) => {
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
  totalTable.appendChild(balanceRow);
}

async function displayTotalExpenseAndProfit(transactions) {
  let userTransactions = await transactions;
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

  const totalTable = document.querySelector("#total-table");

  const expenseRow = createTableRow("Expense", totalExpense);
  const profitRow = createTableRow("Profit", totalProfit);

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

function showSpezificMonth(date) {
  const spezificDate = new Date(date);

  displayMonth(spezificDate);
  updateAllData(spezificDate);
}
function showPreviousMonth(date) {
  const previousDate = new Date(date);
  previousDate.setMonth(previousDate.getMonth() - 1);

  displayMonth(previousDate);
  updateAllData(previousDate);
}
function showNextMonth(date) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + 1);

  displayMonth(nextDate);
  updateAllData(nextDate);
}
function showCurrentMonth() {
  const currentDate = new Date();

  displayMonth(currentDate);
  updateAllData(currentDate);
}

function displayMonth(date) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Dezember"];
  document.getElementById("month").textContent = date.getFullYear() + " " + months[date.getMonth()];
  document.getElementById("hidden_date").textContent = date;
}

function groupProfitCategoryByMonth(date) {
  const currentDate = new Date(date);
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  const userTransactionsByMonth = getUserTransactionsByMonth(startOfMonth, endOfMonth);
  groupAmountByProfitCategory(userTransactionsByMonth);
}
function groupExpenseCategoryByMonth(date) {
  const currentDate = new Date(date);
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  const userTransactionsByMonth = getUserTransactionsByMonth(startOfMonth, endOfMonth);
  groupAmountByExpenseCategory(userTransactionsByMonth);
}

//let typeInput = false;

// transactionsToUI(getUserTransactions(startOfCurrentMonth, endOfCurrentMonth));
// groupAmountByExpenseCategory(getUserTransactions(startOfCurrentMonth, endOfCurrentMonth));
// displayBalance(getUserTransactions(startOfCurrentMonth, endOfCurrentMonth));
//setExpense();

showCurrentMonth();
