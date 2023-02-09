document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-display').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}




function load_mailbox(mailbox) {

  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'none';

  // Fetch emails
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
      console.log(emails);
      for (let email of emails) {
        console.log(email.read);

        let date = new Date(email.timestamp);
        let dateString = date.toLocaleDateString("en-US", {day: "2-digit", month: 'short', year: "numeric"});
        let timeString = date.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", hour12: true});

        const element = document.createElement('div');
        element.classList.add('email-item');
        let bgColor = (email.read == true) ? 'read' :'unread';
        if (email.read == true) {
          element.classList.add("read");
        } else {element.classList.add("unread")};

        element.innerHTML = `<div class="from"> ${email.sender}</div>
                          <div class="subject"> ${email.subject}</div>
                          <div class="timestamp">${dateString}, ${timeString}</div>`;
        element.addEventListener('click', () => email_display(email.id));
        document.querySelector('#emails-view').append(element);                
      }
    });
}



function send_email(event) {
  // Prevent from submitting
  event.preventDefault();

  // Get values form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //Post to values
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  //Go to Sent mailbox
  load_mailbox('sent');
};



function email_display(id) {

  document.querySelector('#email-display').innerHTML = '';


  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-display').style.display = 'block';

  fetch('/emails/'+id)
  .then(response => response.json())
  .then(email => {
      console.log(email);

      let date = new Date(email.timestamp);
      let dateString = date.toLocaleDateString("en-US", {day: "2-digit", month: 'short', year: "numeric"});
      let timeString = date.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", hour12: true});

      const element = document.createElement('div');
        let bgColor = (email.read == true) ? 'read' :'unread';

        element.innerHTML = `<div class="from"> <b>From:</b> ${email.sender}</div>
                            <div class="from"> <b>To:</b> ${email.recipients}</div>

                          <div class="subject"> <b>Subject</b>: ${email.subject}</div>
                          <div class="timestamp"> <b>Sent on</b>: ${dateString}, ${timeString}</div>
                          <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
                          <hr>
                          <div class="subject"> ${email.body}</div>
                          `;
                          
        document.querySelector('#email-display').append(element);   
    });

    fetch('/emails/'+id, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

}