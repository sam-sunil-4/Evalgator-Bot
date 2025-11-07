function cleanEvalgatorBody(message) {
  let cleanedBody = message.getPlainBody();

  const candidateLineRegex = /(No\. of Candidates:\s*)(\d{1,2})[\s\S]*?(?=\n|$)/gm;
  
  if (candidateLineRegex.test(cleanedBody)) {

    candidateLineRegex.lastIndex = 0;
    

    cleanedBody = cleanedBody.replace(candidateLineRegex, "$1$2\n"); 
    Logger.log("Cleaned candidate count from body using highly aggressive candidate pattern.");
  } else {
     Logger.log("No specific cleanup pattern matched for 'No. of Candidates'.");
  }
  
  return cleanedBody;
}

function processEvalgatorEmails() {

  const chatSpaceWebhookUrl = "<Webhook-URL>";

  const threads = GmailApp.search("label:evalgator is:unread");

  if (threads.length === 0) {
    Logger.log("No unread emails with the label 'evalgator' found.");
    return;
  }

  for (const thread of threads) {

    const messages = thread.getMessages();

    const message = messages[messages.length - 1];
    
    const subject = message.getSubject();
    const sender = message.getFrom();

    const calendar = CalendarApp.getDefaultCalendar();
    const events = calendar.getEvents(new Date(), new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), {
      search: subject
    });


    if (events.length > 0) {

      const event = events.find(e => e.getTitle().includes(subject.replace(/Invitatio.+|Decline.+/, "").trim()));
      if (event) {
        try {

          event.setMyStatus(CalendarApp.GuestStatus.YES);
          Logger.log(`Accepted invitation for: ${subject}`);
        } catch (e) {
          Logger.log(`Could not accept meeting for: ${subject}. Error: ${e.message}`);
        }
      }
    }

    let postText = "";
    if (sender.includes("calendar-notification@google.com")) {

      const heading = subject.replace(/^(Invitation:|Accepted:|Declined:)\s*/i, "");
      postText = `\nSubject: ${heading}`;
    } else if (sender.includes("no-reply@evalgator.com")) {

      const body = cleanEvalgatorBody(message); 
      

      postText = `\n\nSubject: ${subject}\n\nBody:\n${body}`;
    } else {

      const body = message.getPlainBody(); 
      postText = `New 'evalgator' email received from a new source:\n\nSubject: ${subject}\n\nBody:\n${body}`;
    }
    

    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify({
        'text': postText
      })
    };

    try {
      UrlFetchApp.fetch(chatSpaceWebhookUrl, options);
      Logger.log(`Posted to Google Chat: ${subject}`);
    } catch (e) {
      Logger.log(`Error posting to Google Chat: ${e.message}`);
    }
    
    thread.markRead();
  }
}
