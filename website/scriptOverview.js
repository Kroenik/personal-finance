// var transactionAmounts = [];

async function getTransactions() {
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
  const transactionsPosition = document.querySelector("#transactions");
  renderTransactions(transactionsPosition, userTransactions);
}

function renderTransactions(position, transactionsData) {
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

function onAddButton(event) {
  //event.preventDefault();

  const inputData = document.forms[0].elements;
  const inputTitle = inputData["input_title"].value;
  //const inputType = inputData["input_type"].value;
  const inputType = document.getElementById("input_type");
  const inputAmount = inputData["input_amount"].value;
  const inputCategory = inputData["input_category"].value;

  if (!inputTitle || !inputAmount) {
    alert("Watch out! - The title and/or amount is missing.");
  } else if (inputTitle.length > 20) {
    alert("Watch out! - The title is too long (max=20digits).");
  } else {
    if (inputType.checked) {
      amount = inputAmount;
    } else {
      convertableAmount = parseFloat(inputAmount) * -1;
      amount = convertableAmount.toString();
    }

    // transactionAmounts.push(amount);

    postToJson({
      title: inputTitle,
      amount: amount,
      //type: inputType,
      category: inputCategory,
      user: localStorage.getItem("username"),
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

//Expense/Profit Button
function checkToProfit() {
  document.getElementById("input_type").checked = true;
}

function uncheckToExpense() {
  document.getElementById("input_type").checked = false;
}

//Total Calculation

// function displayTotal(totalArray) {
//   for (const i = 0; i < totalArray.length; i++) {
//     var total = +totalArray[i];
//   }
//   const bank = document.createElement("div");
//   bank.textContent = total + "€";
//   document.querySelector("categories-side").appendChild(bank);
// }

async function logOut() {
  localStorage.clear();
  window.location.replace("http://localhost:3000");
}

getTransactions();
//displayTotal(transactionAmounts);
