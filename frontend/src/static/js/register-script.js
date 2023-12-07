addEventListener('DOMContentLoaded', (e) => {
    let btn = document.querySelector("#Send");
    btn.addEventListener('click', (e) => {

        let username = document.querySelector("#username");
        let password = document.querySelector("#password");
        let confirmpassword = document.querySelector("#confirmpassword");
        if (password.value != confirmpassword.value) {
            alert("Passwords Do Not Match");
        }
        else {
            let data = {
                username: username.value,
                password: password.value,
                confirmpassword: confirmpassword.value
            }

            fetch('/api/auth/register', {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                if (res.status == 401) {
                    alert("Error in Creating User.");
                }
                else {
                    window.location.href = '/';
                }
            }).catch(err => {
                alert(err);
            });
        }

    });
});