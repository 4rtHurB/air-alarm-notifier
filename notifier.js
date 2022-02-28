(() => {
  const NOTIFY_IMAGE_URL = "https://i.ibb.co/ft46v8C/photo1645977046.jpg";
  const NOTIFY_TEXT_REGEXP =
    "(?!в укриттях)((повітряна тривога)|(сирена)|(в укрития)|(в укриття))";
  const NOTIFY_TEXT_MAX_LENGTH = 90;
  const BOT_API_TOKEN = "1723101065:AAGsRxTnFo8jPZvlHR9IwHxhD44xb-Lkto8";
  const SEND_NOTIFICATION_INTERVAL = 4000; // 5 sec.
  const SEND_NOTIFICATION_TIME = 20000; // 50 sec.
  const CHECK_MESSAGE_INTERVAL = 10000; // 10 sec.
  const CHAT_IDS = [
    //"-1001188577949",
    "-1001507689409",
    // "-1001709615387",
    // "-1001766156712",
    // "-1001547869724",
  ];

  let lastChatIdIndex = 0,
    lastMessageId = null,
    notifierTimerId = null,
    countSendsToMainChat = 0;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function checkMessageByImage(element) {
    try {
      // Click and open image
      await element.getElementsByClassName("full-media open shown")[0].click();
      await delay(1000);

      const downloadBtn = document.getElementsByClassName(
        "Button smaller translucent-white round"
      )[1];

      // Click download image button
      await downloadBtn.click();

      console.log("Message image", downloadBtn.download);
      await delay(1000);

      const res = await fetch(`http://localhost:3030/${downloadBtn.download}`);
      const data = await res.json();

      // Click close image button
      await document
        .getElementsByClassName("Button smaller translucent-white round")[3]
        .click();

      console.log("Message image distance", data.distance);
      return data && +data.distance <= 10;
    } catch (e) {
      console.error(e.message);
      return false;
    }
  }

  function checkMessageByText(element) {
    try {
      const lastMessageTextElement =
        element.getElementsByClassName("text-content")[0];
      console.log("Message text", lastMessageTextElement.textContent);

      return (
        lastMessageTextElement &&
        lastMessageTextElement.textContent.length <= NOTIFY_TEXT_MAX_LENGTH &&
        new RegExp(NOTIFY_TEXT_REGEXP, "gi").test(
          lastMessageTextElement.textContent
        )
      );
    } catch (e) {
      console.error(e.message);
      return false;
    }
  }

  async function sendMessageToTelegram(text) {
    // if (countSendsToMainChat < 2) {
    //   lastChatIdIndex = 0;
    // } else {
    //   lastChatIdIndex =
    //     lastChatIdIndex === null
    //       ? 0
    //       : lastChatIdIndex === CHAT_IDS.length - 1
    //       ? 0
    //       : lastChatIdIndex + 1;
    // }

    // if (lastChatIdIndex === 0) {
    //   countSendsToMainChat++;
    // }

    console.log(`Send to ${CHAT_IDS[lastChatIdIndex]}`);
    await fetch(`https://api.telegram.org/bot${BOT_API_TOKEN}/sendPhoto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        photo: NOTIFY_IMAGE_URL,
        chat_id: CHAT_IDS[lastChatIdIndex],
      }),
    });
  }

  function runNotifyToTelegram(text) {
    console.log(`Start notify`);
    notifierTimerId = setInterval(
      () => sendMessageToTelegram(text),
      SEND_NOTIFICATION_INTERVAL
    );
  }

  function stopNotifyToTelegram() {
    console.log(`Stop notify`);
    clearInterval(notifierTimerId);
    lastChatIdIndex = 0;
    notifierTimerId = null;
    countSendsToMainChat = 0;
  }

  async function checkMessage() {
    console.log("-----------------------------------------");
    const messageElements = Array.from(
      document.getElementsByClassName("message-list-item")
    ).filter((el) => el);

    const lastMessageElement = messageElements[messageElements.length - 1];
    console.log("Last message id", lastMessageId);
    console.log("Message id", lastMessageElement.id);

    if (lastMessageId !== lastMessageElement.id) {
      lastMessageId = lastMessageElement.id;

      const isNotifyMessage = lastMessageElement.getElementsByClassName(
        "text-content"
      )[0]
        ? checkMessageByText(lastMessageElement)
        : await checkMessageByImage(lastMessageElement);

      if (isNotifyMessage && notifierTimerId === null) {
        runNotifyToTelegram(lastMessageElement.textContent);
        setTimeout(() => stopNotifyToTelegram(), SEND_NOTIFICATION_TIME);
      }
    }
  }

  setInterval(checkMessage, CHECK_MESSAGE_INTERVAL);
})();
