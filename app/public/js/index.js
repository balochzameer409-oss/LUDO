function register() {
    let modal = document.getElementById("myModal");
    modal.classList.add("show");
    modal.style.display = "flex";

    document.querySelector(".close").onclick = function () {
        modal.style.display = "none";
        modal.classList.remove("show");
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            modal.classList.remove("show");
        }
    };
}

function ShowHideDiv() {
    let room_code = document.getElementById("room_code");
    let join = document.getElementById('JOIN');
    let create = document.getElementById('CREATE');

    // highlight selected card
    document.getElementById('label-join').classList.toggle('selected-join', join.checked);
    document.getElementById('label-create').classList.toggle('selected-create', create.checked);

    room_code.style.display = (join.checked && !create.checked) ? "block" : "none";
}
