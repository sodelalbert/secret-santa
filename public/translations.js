const translations = {
  en: {
    title: "Secret Santa 🎅",
    subtitle:
      "Who will buy presents for whom? Add list of your deers along with their phone numbers to notify them via SMS. Happy Christmas! 🎄",
    namePlaceholder: "Enter participant name",
    phonePlaceholder: "Phone (optional)",
    addButton: "Add",
    noParticipants: "No participants yet",
    participantCount: {
      singular: "participant",
      plural: "participants",
    },
    generateButton: "Generate Gift Assignments 🎁",
    resetButton: "Clear Assignments & Start Over",
    sendSmsButton: "📱 Send SMS to All Participants",
    sendingSms: "📱 Sending SMS...",
    smsSent: "✅ SMS Sent!",
    resultsTitle: "🎁 Results",
    willBuyFor: "will buy a present for",
    editButton: "Edit",
    removeButton: "Remove",
    errors: {
      enterName: "Please enter a name",
      duplicateName: "This person is already in the list",
      invalidPhone:
        "Phone number must contain exactly 9 digits (e.g., 123456789)",
      cannotModify:
        "Cannot modify participants after generating assignments. Please reset first.",
      alreadyGenerated:
        "Assignments already generated. Please reset to generate again.",
      failedToGenerate: "Failed to generate assignments",
      failedToSendSms: "Failed to send SMS",
    },
    success: {
      smsSummary:
        "SMS sent successfully! Sent: {sent}, Failed: {failed}, Skipped: {skipped}",
    },
  },
  pl: {
    title: "Sekretny Mikołaj 🎅",
    subtitle:
      "Kto komu kupi prezent? Dodaj listę uczestników wraz z numerami telefonów, aby powiadomić ich SMS-em. Wesołych Świąt! 🎄",
    namePlaceholder: "Wpisz imię uczestnika",
    phonePlaceholder: "Telefon (opcjonalnie)",
    addButton: "Dodaj",
    noParticipants: "Brak uczestników",
    participantCount: {
      singular: "uczestnik",
      plural: "uczestników",
    },
    generateButton: "Generuj listę Mikołajów 🎁",
    resetButton: "Wyczyść i Zacznij Od Nowa",
    sendSmsButton: "📱 Wyślij SMS do Wszystkich",
    sendingSms: "📱 Wysyłanie SMS...",
    smsSent: "✅ SMS Wysłany!",
    resultsTitle: "🎁 Wyniki",
    willBuyFor: "kupi prezent dla",
    editButton: "Edytuj",
    removeButton: "Usuń",
    errors: {
      enterName: "Proszę wpisać imię",
      duplicateName: "Ta osoba jest już na liście",
      invalidPhone:
        "Numer telefonu musi zawierać dokładnie 9 cyfr (np. 123456789)",
      cannotModify:
        "Nie można modyfikować uczestników po wygenerowaniu przydziałów. Proszę najpierw zresetować.",
      alreadyGenerated:
        "Przydziały już wygenerowane. Proszę zresetować, aby wygenerować ponownie.",
      failedToGenerate: "Nie udało się wygenerować przydziałów",
      failedToSendSms: "Nie udało się wysłać SMS",
    },
    success: {
      smsSummary:
        "SMS wysłany pomyślnie! Wysłane: {sent}, Nieudane: {failed}, Pominięte: {skipped}",
    },
  },
};

let currentLang = localStorage.getItem("language") || "pl";

function t(key) {
  const keys = key.split(".");
  let value = translations[currentLang];

  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }

  return value;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("language", lang);
  updateUI();
}

function updateUI() {
  // Update static text
  document.querySelector("h1").textContent = t("title");
  document.querySelector(".subtitle").textContent = t("subtitle");
  document.getElementById("nameInput").placeholder = t("namePlaceholder");
  document.getElementById("phoneInput").placeholder = t("phonePlaceholder");
  document.querySelector(".btn-add").textContent = t("addButton");
  document.getElementById("generateBtn").textContent = t("generateButton");
  document.getElementById("resetBtn").textContent = t("resetButton");

  const sendSmsBtn = document.getElementById("sendSmsBtn");
  if (sendSmsBtn.textContent.includes("✅")) {
    sendSmsBtn.textContent = t("smsSent");
  } else if (
    sendSmsBtn.textContent.includes("Sending") ||
    sendSmsBtn.textContent.includes("Wysyłanie")
  ) {
    sendSmsBtn.textContent = t("sendingSms");
  } else {
    sendSmsBtn.textContent = t("sendSmsButton");
  }

  // Re-render participants to update count and buttons
  renderParticipants();

  // Update results if visible
  const resultsDiv = document.getElementById("results");
  if (resultsDiv.classList.contains("show")) {
    const h2 = resultsDiv.querySelector("h2");
    if (h2) {
      h2.textContent = t("resultsTitle");
    }
  }
}
