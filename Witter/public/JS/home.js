function validateForm() {
  let weetText = document.forms["newWeet"]["weet"].value;
  if (weetText == "") {
    alert("Your weet can't be empty!");
    return false;
  }
}
