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
  appendTransactionsToHTML(transactionsPosition, await userTransactions);
}

function appendTransactionsToHTML(position, transactionsData) {
  for (const transactionData of transactionsData) {
    const newTransaction = createTransaction(transactionData);
    position.prepend(newTransaction);
  }
}

function createTransaction(data) {
  const transactionDiv = document.createElement("div");
  transactionDiv.classList.add("transaction");

  const amountP = document.createElement("p");
  if (data.amount < 0) {
    amountP.classList.add("expense");
  } else {
    amountP.classList.add("profit");
  }

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

    // transactionAmounts.push(amount);

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
}

function setProfit() {
  typeInput = true;
}
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
async function groupAmountByCategorie(transactions) {
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
  const transactionsPosition = document.querySelector("#categroies");
  for (const categorie of amountsByCategory) {
    const newCategorie = createCategory(categorie);
    transactionsPosition.prepend(newCategorie);
  }
}

function createCategory(data) {
  const categoryDiv = document.createElement("div");
  const amountP = document.createElement("p");
  const categoryP = document.createElement("p");
  categoryP.classList.add("category");
  categoryDiv.appendChild(amountP);
  categoryDiv.appendChild(categoryP);

  amountP.textContent = data[1] + "€";
  categoryP.textContent = data[0];

  return categoryDiv;
}

function displayTotal(totalArray) {
  let total;
  totalArray.forEach((transaction) => {
    total += transaction.amount;
  });
  //   const bank = document.createElement("div");
  //   bank.textContent = total + "€";
  //   document.querySelector("categories-side").appendChild(bank);
}

async function logOut() {
  localStorage.clear();
  window.location.replace("http://localhost:3000");
}
let typeInput;

transactionsToUI(getUserTransactions());
groupAmountByCategorie(getUserTransactions());

//displayTotal(transactionAmounts);
