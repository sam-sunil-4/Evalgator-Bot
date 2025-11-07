# mail-to-google-space
This script efficiently sends mail alerts to the Google Chat space.


We had a really hectic manual task of copying an alert, which is coming as an email, and pasting it to the respective client's Google Chat space. This was really boring, time-consuming, and exhausting too. So I think about automating this stuff and have done some research, and found out about the Google App Scripts gem. This tool utilizes Google Scripts, which are essentially JavaScript-based, and helps us easily automate tasks like this.

What I'm doing here is vibe-code a JavaScript-based GS file that scans the email inbox for emails with a particular label. If it finds those unread emails, this script will send the mail to the corresponding Google space via webhook and mark them as read. This also compares the mails using the message ID so that if we get multiple mails in the same thread, everything will be sent to the space without duplication.

After completing the testing, I set up a time-based trigger for every minute in the same Google App Script so that this script will run every minute of the day, and we don't lose any emails. Also the same trigger will notify us immediately with the error message if any of the executions fail.
