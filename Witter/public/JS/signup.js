let email_input = document.getElementById("em");
let username_input = document.getElementById("un");
let btn = document.getElementById("sign-up-button");

async function fetchData(url){
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

email_input.onchange = async function() {
  let email = email_input.value;
  let url = `/api/email_available?email=${email}`;
  let avail = await fetchData(url);

  em_message = document.getElementById("email-message");
  if (avail == false) {
    em_message.innerHTML = "That email is already in use";
    btn.disabled = true;
  } else {
    em_message.innerHTML = "";
    btn.disabled = false;
  }
};

username_input.onchange = async function() {
  let username = username_input.value;
  let url = `/api/username_available?username=${username}`;
  let avail = await fetchData(url);

  un_message = document.getElementById("username-message");
  if (avail == false) {
    un_message.innerHTML = "That username is not available";
    btn.disabled = true;
  } else {
    un_message.innerHTML = "";
    btn.disabled = false;
  }
};

function validateForm() {
  let nameInput = document.forms["signup"]["name"].value;
  let sexInput = document.forms["signup"]["userSex"].value;
  let emailInput = document.forms["signup"]["email"].value;
  let usernameInput= document.forms["signup"]["username"].value;
  let passwordInput= document.forms["signup"]["pwd"].value;

  if (nameInput == "") {
    alert("Name must be filled out");
    return false;
  }
  if (sexInput == "") {
    alert("Sex must be filled out");
    return false;
  }
  if (emailInput == "") {
    alert("Email must be filled out");
    return false;
  }
  if (usernameInput == "") {
    alert("Username must be filled out");
    return false;
  }
  if (passwordInput == "") {
    alert("Password must be filled out");
    return false;
  }
}
