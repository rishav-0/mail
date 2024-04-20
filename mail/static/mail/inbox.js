document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  //submit handler
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_emial);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function view_mail(id) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      //clear existing content in emails view
      document.querySelector("#emails-view").innerHTML = "";

      //Hide other views and display the email details view
      document.querySelector("#emails-view").style.display = "block";
      document.querySelector("#compose-view").style.display = "none";

      // Create div to display email details
      console.log(email);
      const emailDiv = document.createElement("div");
      emailDiv.className = "card";
      emailDiv.innerHTML = `
      
        <div class="card-header">
          From: ${email.sender}</br>
          To: ${email.recipients}
          
        </div>
        <div class="card-body">
          <h6 class="card-title">${email.subject}</h6>
          <p class="card-text">${email.body}</p>
          <p class="card-text">${email.timestamp}</p>
        </div>
      `;

      //reply button
      const reply = document.createElement("a");
      reply.innerText = "Reply";
      reply.href = "#";
      reply.className = "btn btn-primary mr-2";
      reply.addEventListener("click", function (event) {
        event.preventDefault();
        compose_email();
        document.querySelector("#compose-recipients").value = email.sender;
        let subject = email.subject;
        if (!subject.startsWith("Re:")) {
          subject = `Re: ${subject}`;
        }
        document.querySelector("#compose-subject").value = subject;
        document.querySelector(
          "#compose-body"
        ).value = `On ${email.timestamp} ${email.sender} wrote ${email.body}`;
      });

      //read status
      if (!email.read) {
        fetch(`/emails/${email.id}`, {
          method: "PUT",
          body: JSON.stringify({
            read: true,
          }),
        });
      }
      const btnArch = document.createElement("button");
      btnArch.innerHTML = email.archived ? "Unarchive" : "Archive";
      btnArch.className = email.archived
        ? "btn btn-secondary mr-2"
        : "btn btn-dark mr-2";
      btnArch.addEventListener("click", function () {
        fetch(`/emails/${email.id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: !email.archived,
          }),
        }).then(() => {
          load_mailbox("inbox");
        });
      });

      // Append email details div to emails view
      document.querySelector("#emails-view").appendChild(emailDiv);
      emailDiv.querySelector(".card-body").appendChild(reply);
      document.querySelector(".card-body").append(btnArch);
    });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  //geting the emails from the server for the user
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())

    .then((emails) => {
      //looping through all emials using for each loop
      emails.forEach((singleEmail) => {
        console.log(singleEmail);
        //creating div for each singleEmail
        const emailDiv = document.createElement("div");
        emailDiv.className = "list-group-item";
        emailDiv.innerHTML = `
          <strong> Sender: </strong>${singleEmail.sender}</br>
          <strong >Subject: </strong>${singleEmail.subject}</br>
          ${singleEmail.timestamp}</br>

        `;

        //changing colour according to click or not
        if (singleEmail.read === true) {
          emailDiv.style.backgroundColor = "lightgrey";
        } else {
          emailDiv.style.backgroundColor = "white";
        }

        //adding event listener to the div if its clicked or not
        emailDiv.addEventListener("click", function () {
          view_mail(singleEmail.id);
        });
        document.querySelector("#emails-view").append(emailDiv);
      });
    });
}

function send_emial(event) {
  event.preventDefault();
  // store tha data
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  // send the data to the server
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Print result
      console.log(result);
      load_mailbox("sent");
    });
}
