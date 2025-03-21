
console.log("Script loaded, waiting for interactions...");
const regContainer = document.getElementById("register-container");
const logContainer = document.getElementById("login-container");
const toggleLogin = document.getElementById('toggleLogin')
const toggleRegister = document.getElementById('toggleRegister')

if (regContainer && logContainer) {
  regContainer.style.display = "none";
  toggleLogin?.classList.add("bg-black");
}
let arr = [logContainer, regContainer];

enum PageState {
  Login = 0,
  Register,
};

toggleLogin?.addEventListener('click', () => {
  if (arr[PageState.Login] && arr[PageState.Register]) {
    toggleLogin.classList.add("bg-black");
    toggleRegister?.classList.remove("bg-black");
    arr[PageState.Login].style.display = "block";
    arr[PageState.Register].style.display = "none";
  }
})

toggleRegister?.addEventListener('click', () => {
  if (arr[PageState.Login] && arr[PageState.Register]) {
    toggleRegister.classList.add("bg-black");
    toggleLogin?.classList.remove("bg-black");
    arr[PageState.Register].style.display = "block";
    arr[PageState.Login].style.display = "none";
  }
})


console.log("OK");

